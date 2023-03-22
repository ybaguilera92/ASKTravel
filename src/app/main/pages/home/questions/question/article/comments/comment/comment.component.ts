import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {FuseConfigService} from "../../../../../../../../../@fuse/services/config.service";
import {Router} from "@angular/router";
import {AuthenticationService} from "../../../../../../../../services/authentication.service";
import {FuseDialogService} from "../../../../../../../../../@fuse/services/dialog.service";
import {TokenStorageService} from "../../../../../../../../services/token.service";
import {QuestionService} from "../../../question.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommonService} from "../../../../../../../../services/common.service";
import {AddCommentService} from "../../add-comment/add-comment.service";


@Component({
    selector     : 'comment-template',
    templateUrl  : './comment.component.html',
    styleUrls    : ['./comment.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CommentComponent implements OnInit, OnDestroy
{
    @Input() public comment: any;
    @Input() public objectType: any;
    @Input() public templateType: any;

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
        public fuseDialogService: FuseDialogService
    )
    {

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
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
    end = false;


    /**
     * On init
     */
    ngOnInit(): void {}

    /**
     * On destroy
     */
    ngOnDestroy(): void
    { // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}