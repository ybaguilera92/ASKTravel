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
import {objectType, templateType} from "../../../../generic.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AddCommentService} from "./add-comment.service";
import {Login2Component} from "../../../../../authentication/login-2/login-2.component";
import {FuseSplashScreenService} from "../../../../../../../../@fuse/services/splash-screen.service";


@Component({
    selector     : 'reply',
    templateUrl  : './add-comment.component.html',
    styleUrls    : ['./add-comment.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AddCommentComponent implements OnInit, OnDestroy
{
    @Input() public object: any;
    @Input() public type: string;
    @Input() public template: string;
    isUserLogged;
    reaction: Observable<any>;
    showComment = false;

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
        private commentService: AddCommentService,
        private formBuilder: FormBuilder,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private homeService: HomeService
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
    voting: boolean = false;
    templateType = templateType;
    objectType = objectType;
    form: FormGroup;

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._authenticationService.isUserLogged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => this.isUserLogged = data );

        this.form = this.formBuilder.group({
            'description': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
        });

        this.questionService.onSelectBestAnswer
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(res => {
                if(res.id !== this.object.id){
                    this.object.best = false;
                }
            });
    }

    comment() {
        if(this.isUserLogged) {
            this.showComment = true;
        } else {
            this.fuseDialogService.buildDialogStyle(Login2Component, {
                width: '850px'
            });
        }
        return false;
    }

    cancelComment() {
        this.showComment = false;
        return false;
    }

    makeComment() {
            let params = this.form.getRawValue();
            params.objectId = this.object.id;
            params.type = this.type;
            this.commentService.makeComment(params);
            this.form.reset();
            this.cancelComment();
    }

    selectBestAnswer(value) {
        this._fuseSplashScreenService.show();
        this.object['best'] = value;
        this.questionService.updateAnswer(this.object)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(res => {
                if(res){
                    this._fuseSplashScreenService.hide();
                    this.questionService.onSelectBestAnswer.next(res['data']);
                    this.homeService.setReloadAsideNavBar(true);
                }
            })

       return false;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}