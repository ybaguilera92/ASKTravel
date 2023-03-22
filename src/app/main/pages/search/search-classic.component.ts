import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';

import { SearchClassicService } from 'app/main/pages/search/search-classic.service';
import {FuseConfigService} from "../../../../@fuse/services/config.service";
import {FormControl} from "@angular/forms";
import {HomeService} from "../home/home.service";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

@Component({
    selector     : 'search-classic',
    templateUrl  : './search-classic.component.html',
    styleUrls    : ['./search-classic.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SearchClassicComponent implements OnInit, OnDestroy
{
    searchItems: any;
    searchControl: any;
    question: any;
    questions: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {SearchClassicService} _searchClassicService
     */
    constructor(
        private _searchClassicService: SearchClassicService,
        private _fuseConfigService: FuseConfigService,
        private _faqService: HomeService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.searchControl = new FormControl('');

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
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
        this._searchClassicService.dataOnChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(searchItems => {
                this.searchItems = searchItems;
            });

        this.questions = this.searchControl.valueChanges
            .pipe(
                debounceTime(250),
                distinctUntilChanged(),
                switchMap(value => this._faqService.search({question: value}, 1)));

        this._searchClassicService.questionOnChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(question => {
                this.question = question;
            });
    }

    clear(){
        this.question = "";
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

    findAnswers(event) {
        this._searchClassicService.getSearchData(event.option.value);
    }

    findAnswersOnEnter(event){
        this._searchClassicService.getSearchData(this.searchControl.value);
    }
}
