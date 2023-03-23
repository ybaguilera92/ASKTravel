import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";

import {Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Question} from "../../../../../../models/question";
import {FuseConfigService} from "../../../../../../../@fuse/services/config.service";
import {HomeService} from "../../../home.service";
import {AuthenticationService} from "../../../../../../services/authentication.service";
import {FuseDialogService} from "../../../../../../../@fuse/services/dialog.service";
import {TokenStorageService} from "../../../../../../services/token.service";
import {QuestionService} from "../question.service";
import {isNullOrEmpty} from "../../../../../../fuse-config";
import {User} from "../../../../../../models/user";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommonService} from "../../../../../../services/common.service";
import {Login2Component} from "../../../../authentication/login-2/login-2.component";
import {objectType, templateType} from "../../../generic.model";
import { DomSanitizer } from '@angular/platform-browser';


@Component({
    selector: 'question-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ArticleComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() public question: Question;
    @Input() public type: string = 'single';
    currentUser: User;
    objectType = objectType;
    templateType = templateType;
    fileEncode : any;
    readonly TAB_NAGIGATION = {
        VOTED: 'VOTED',
        OLDEST: 'OLDEST',
        RECENT: 'RECENT',
        RANDOM: 'RANDOM'
    }
    activeTab: any
    voting: boolean = false;

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
        private commonService: CommonService,
        private domSanitizer: DomSanitizer,
       
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

    /**
     * On init
     */
    ngOnInit(): void {
       
        this._authenticationService.currentUser.subscribe((user) => {
            this.currentUser = !isNullOrEmpty(user) ? user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.tokenStorage.getUser() : null;
        });
        if (!isNullOrEmpty(this.question.user.fileEncode)) {            
            this.photo_url(this.question.user.fileEncode);
           // this.question.user.fileEncode = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64, " + this.question.user.fileEncode);      
        }
    }
    photo_url(data: string) {
        this.fileEncode = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64, " + data);

    }
   
    ngAfterViewInit(){
        //this.sort(this.TAB_NAGIGATION.OLDEST);
    }
    ngAfterContentChecked() {

        //debugger;
        // this.sampleViewModel.DataContext = this.DataContext;
        // this.sampleViewModel.Position = this.Position;

    }

    vote(object: any, value: boolean, type: string) {
        if (this.currentUser) {
            let reaction = object.reactions.find(r => r.user.id === this.currentUser.id);

            this.voting = true;
            this.commonService.vote({
                question: object.id,
                type: type,
                reaction: value
            });
            /*else {
               this._matSnackBar.open('Lo sentimos, no puede votar sobre la misma pregunta más de una vez.', '', {
                   verticalPosition: 'top',
                   duration        : 3000
               });
           }*/
        } else {
            {
                this.fuseDialogService.buildDialogStyle(Login2Component, {
                    width: '850px'
                });
            }
        }
    }

    sort(type) {
        this.activeTab = type;
        switch (type) {
            case this.TAB_NAGIGATION.VOTED:
                this.question.answers.sort((a, b) => (a.reactions.filter(r => r.reaction) - a.reactions.filter(r => !r.reaction)) - (b.reactions.filter(r => r.reaction) - b.reactions.filter(r => !r.reaction)) < 0 ? 1 : -1)
                break;
            case this.TAB_NAGIGATION.OLDEST:
                this.question.answers.sort((a, b) => (new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()) > 0 ? 1 : -1);
                break;
            case this.TAB_NAGIGATION.RECENT:
                this.question.answers.sort((a, b) => (new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()) < 0 ? 1 : -1);
                break;
            default:
                this.question.answers = this.question.answers.sort((a, b) => Math.floor(Math.random() * a.id) - Math.floor(Math.random() * b.id)  > 0 ? 1 : -1);
                break;
        }

        return false;
    }

    initSort(){
        return this.question.answers.sort((a, b) => (a.reactions.filter(r => r.reaction) - a.reactions.filter(r => !r.reaction)) - (b.reactions.filter(r => r.reaction) - b.reactions.filter(r => !r.reaction)) < 0 ? 1 : -1)
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {

    }

}