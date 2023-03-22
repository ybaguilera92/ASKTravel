import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {FuseConfigService} from "../../../../../@fuse/services/config.service";
import {HomeService} from "../home.service";
import {ActivatedRoute, ParamMap, Route, Router} from "@angular/router";
import {User} from "../../../../models/user";
import {map, takeUntil} from "rxjs/operators";
import {isNullOrEmpty} from "../../../../fuse-config";
import {CommonService} from "../../../../services/common.service";
import {HttpParams} from "@angular/common/http";
import {LinkedList} from "../../../../models/linked-list/linked.list";

@Component({
    selector     : 'navigation-question',
    templateUrl  : './questions.component.html',
    styleUrls    : ['./questions.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class QuestionsComponent implements OnInit, OnDestroy
{
    currentUser: User;
    data$: Observable<any>;

    // Private
    private _unsubscribeAll: Subject<any>;
    phrase = '';
    type: any;

    /**
     * Constructor
     *
     * @param {HomeService} _faqService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private commonService: CommonService,
        private route: ActivatedRoute,
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

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.data$ = this.homeService.data$

        this.type = this.homeService.NAVIGATION.RECENT_QUESTIONS;
        this.route.paramMap.subscribe((params: ParamMap) => {
            if(!isNullOrEmpty(params.get('question'))){
                this.phrase = params.get('question');
            }
        })
    }

    /**
     * Find questions by phrases
     */
    goTo(){
        if(!isNullOrEmpty(this.phrase)){
            this.type = this.homeService.NAVIGATION.BY_PHRASE;
             this.homeService.goTo(this.type);
        }
    }

    onScroll() {
        this.homeService.goTo(this.type);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {

    }
}