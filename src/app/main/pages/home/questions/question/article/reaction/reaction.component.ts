import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Observable, Subject} from "rxjs";

import {Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Question} from "../../../../../../../models/question";
import {FuseConfigService} from "../../../../../../../../@fuse/services/config.service";
import {HomeService} from "../../../../home.service";
import {AuthenticationService} from "../../../../../../../services/authentication.service";
import {FuseDialogService} from "../../../../../../../../@fuse/services/dialog.service";
import {TokenStorageService} from "../../../../../../../services/token.service";
import {QuestionService} from "../../question.service";
import {isNullOrEmpty} from "../../../../../../../fuse-config";
import {User} from "../../../../../../../models/user";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommonService} from "../../../../../../../services/common.service";
import {Login2Component} from "../../../../../authentication/login-2/login-2.component";
import {objectType, templateType} from "../../../../generic.model";


@Component({
    selector: 'reaction',
    templateUrl: './reaction.component.html',
    styleUrls: ['./reaction.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ReactionComponent implements OnInit, OnDestroy {
    @Input() public object: any;
    @Input() public type: string;
    @Input() public template: string;
    isUserLogged: boolean;
    reaction: Observable<any>;

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
        private commonService: CommonService
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

    /**
     * On init
     */
    ngOnInit(): void {
        this._authenticationService.isUserLogged.pipe(takeUntil(this._unsubscribeAll)).subscribe(data => this.isUserLogged = data );
        this.reaction = this.commonService.getReactions(this.object.id, this.type);

        this.commonService.onReactionQuestion.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
            if (!isNullOrEmpty(response) && response && this.voting) {
                this.reaction = this.commonService.getReactions(this.object.id, this.type);
                this.voting = false;
            }
        })

        this.commonService.onReactionQuestionError.pipe(takeUntil(this._unsubscribeAll)).subscribe(error => {
            if (!isNullOrEmpty(error) && error['status'] && this.voting) {
                this._matSnackBar.open(error['error'][0], '', {
                    verticalPosition: 'top',
                    duration: 3000
                });
                this.voting = false;
            }
        })
    }


    vote(object: any, value: boolean, type: string) {
        if (this.isUserLogged) {
            this.voting = true;
            this.commonService.vote({
                question: object.id,
                type: type,
                reaction: value
            });
        } else {
            {
                this.fuseDialogService.buildDialogStyle(Login2Component, {
                    width: '850px'
                });
            }
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void { // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

    }

}