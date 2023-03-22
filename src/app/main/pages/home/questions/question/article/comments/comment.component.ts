import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";

import {Router} from "@angular/router";
import {FuseConfigService} from "../../../../../../../../@fuse/services/config.service";
import {HomeService} from "../../../../home.service";
import {AuthenticationService} from "../../../../../../../services/authentication.service";
import {FuseDialogService} from "../../../../../../../../@fuse/services/dialog.service";
import {TokenStorageService} from "../../../../../../../services/token.service";
import {QuestionService} from "../../question.service";
import {isNullOrEmpty} from "../../../../../../../fuse-config";
import {User} from "../../../../../../../models/user";
import {MatSnackBar} from "@angular/material/snack-bar";
import {objectType, templateType} from "../../../../generic.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AddCommentService} from "../add-comment/add-comment.service";
import {takeUntil} from "rxjs/operators";


@Component({
    selector: 'comment',
    template: `
        <ul class="children">
            <li class="comment">
                <comment-template [comment]="comment"
                                  [objectType]="objectType.COMMENT"
                                  [templateType]="templateType.WEB">
                </comment-template>
                <ul class="children" *ngIf="descendants$ | async as descendants">
                    <ng-container *ngFor="let child of descendants">
                        <li class="comment">
                            <comment [comment]="child"></comment>
                        </li>
                    </ng-container>
                </ul>
            </li>
        </ul>
    `
})
export class CommentsComponent implements OnInit, OnDestroy {
    @Input() public comment: any;
    currentUser: User;
    reaction: Observable<any>;
    descendants$: BehaviorSubject<any> = new BehaviorSubject<any>([]);

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {HomeService} _faqService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private router: Router,
        private _authenticationService: AuthenticationService,
        public fuseDialogService: FuseDialogService,
        private tokenStorage: TokenStorageService,
        private questionService: QuestionService,
        private _matSnackBar: MatSnackBar,
        private formBuilder: FormBuilder,
        private addCommentService: AddCommentService
    ) {

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: false
                },
                sidepanel: {
                    hidden: false
                }
            }
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    voting: boolean = false;
    templateType = templateType;
    objectType = objectType;
    form: FormGroup;

    /**
     * On init
     */
    ngOnInit(): void {
        this._authenticationService.currentUser.
        pipe(takeUntil((this._unsubscribeAll))).
        subscribe((user) => {
            this.currentUser = !isNullOrEmpty(user) ? user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.tokenStorage.getUser() : null;
        });
        this.addCommentService.getComments().
        pipe(takeUntil((this._unsubscribeAll))).subscribe(comment => {
            if (this.comment.id === comment['id']) {
                this.descendants$.next(comment['descendants']);
            }
        });
        this.descendants$.next(this.comment.descendants);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void { // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}