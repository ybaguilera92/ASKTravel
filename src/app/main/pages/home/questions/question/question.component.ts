import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {Subject} from "rxjs";
import {User} from "../../../../../models/user";
import {FuseConfigService} from "../../../../../../@fuse/services/config.service";
import {HomeService} from "../../home.service";
import {AuthenticationService} from "../../../../../services/authentication.service";
import {FuseDialogService} from "../../../../../../@fuse/services/dialog.service";
import {TokenStorageService} from "../../../../../services/token.service";
import {Router} from "@angular/router";
import {Question} from "../../../../../models/question";
import {QuestionService} from "./question.service";
import {takeUntil} from "rxjs/operators";
import {isNullOrEmpty} from "../../../../../fuse-config";
import {CommonService} from "../../../../../services/common.service";
import {HttpParams} from "@angular/common/http";
import {Item} from "../../../../../models/linked-list/item";


@Component({
    selector     : 'question',
    templateUrl  : './question.component.html',
    styleUrls    : ['./question.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class QuestionComponent implements OnInit, OnDestroy
{
    currentUser: User;
    question: Question;

    // Private
    private _unsubscribeAll: Subject<any>;
    disabledNavigation= false;
    currentItem: Item<any>;

    /**
     * Constructor
     *
     * @param {HomeService} homeService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private homeService: HomeService,
        private commonService: CommonService,
        private router: Router,
        private _authenticationService: AuthenticationService,
        public fuseDialogService: FuseDialogService,
        private tokenStorage: TokenStorageService,
        private questionService: QuestionService
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

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.questionService.onQuestionChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(question => {
                if(!isNullOrEmpty(question)){
                    this.question = question;
                    this.loadQuestionNavigation();
                }
            });
    }

    questionNextNavigation() {
        if (!isNullOrEmpty(this.currentItem.next)) {
            this.router.navigate(['/question/', this.currentItem.next.data.id]);
            this.disabledNavigation= false;
        } else {
            this.homeService.pageIndex += 1;
            this.commonService.getQuestionsByParams(new HttpParams()
                .set('pageIndex', this.homeService.pageIndex.toString())
                .set('pageSize', this.homeService.pageSize.toString())
                .set('type', this.homeService.activeNavigation)
            ).pipe(takeUntil(this._unsubscribeAll))
                .subscribe( response => {
                    if(!isNullOrEmpty(response['questions']) && response['questions'].length > 0){
                        this.disabledNavigation= false;
                        response['questions'].forEach( question => this.homeService.dataNavigation.insertAtEnd(question));
                        this.questionService.onQuestionChanged.next(response['questions'][0]);
                    } else{
                        this.disabledNavigation = true;
                    }
                })
        }

        return false;
    }

    questionPrevNavigation() {
        if (!isNullOrEmpty(this.currentItem.prev)) {
            this.router.navigate(['/question/', this.currentItem.prev.data.id]);
            this.disabledNavigation= false;
        }
        return false;
    }

    loadQuestionNavigation() {
         this.currentItem = this.homeService.dataNavigation.search(({id}) => id === this.question.id);
    }

    disableNavigation(object){
      return isNullOrEmpty(object);
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