import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import {TodoService} from "../../todo.service";
import {CommonService} from "../../../../../../services/common.service";
import {QuestionFilter} from "./filter.model";
import {isNullOrEmpty} from "../../../../../../fuse-config";
import {AuthenticationService} from "../../../../../../services/authentication.service";
import {User} from "../../../../../../models/user";
import {TokenStorageService} from "../../../../../../services/token.service";

@Component({
    selector     : 'todo-main-sidebar',
    templateUrl  : './main-sidebar.component.html',
    styleUrls    : ['./main-sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class TodoMainSidebarComponent implements OnInit, OnDestroy
{
    folders: any[];
    filters: any[];
    tags: any[];
    accounts: object;
    selectedAccount: string;
    filterModel: QuestionFilter;
    currentUser: User;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {TodoService} _todoService
     * @param {Router} _router
     */
    constructor(
        private _todoService: TodoService,
        private _router: Router,
        private commonService: CommonService,
        private _authenticationService: AuthenticationService,
        private tokenStorage: TokenStorageService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.filterModel = new QuestionFilter();
        this._todoService.onFiltersChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(filters => {
                this.filters = filters;
            });

        this._todoService.onTagsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(tags => {
                this.tags = tags;
            });

        this._authenticationService.currentUser.subscribe((user) => {
            this.currentUser = !isNullOrEmpty(user) ? user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.tokenStorage.getUser() : null;
            this.accounts = {
                creapond    : this.currentUser.email,
                withinpixels: this.currentUser.email
            };
            this.selectedAccount = 'creapond';
        });
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * New todo
     */
    newTodo(): void
    {
        this._router.navigate(['/admin/questions']).then(() => {
            setTimeout(() => {
                this._todoService.onNewTodoClicked.next('');
            });
        });
    }

    /**
     * Filter questions by status
     */
    goTo(status: string) {
        if(status == "clear"){
            this._todoService.questionFilter = new QuestionFilter();
        } else {
            this._todoService.questionFilter.status = status;
        }
        this._todoService.findQuestionsByFilter();
    }

    /**
     * Filter questions by tag
     */
    filterByTag(tag: string) {
        this._todoService.questionFilter.tag = tag;
        this._todoService.findQuestionsByFilter();
    }

    activeFilter(type, filter){
        switch (type){
            case 'status':
                return !isNullOrEmpty(this._todoService.questionFilter.status) && filter.id == this._todoService.questionFilter.status;
            case 'tag':
                return !isNullOrEmpty(this._todoService.questionFilter.tag) && filter.id == this._todoService.questionFilter.tag
        }
    }

    isEmptyFilter(){
        return isNullOrEmpty(this._todoService.questionFilter.status) && isNullOrEmpty(this._todoService.questionFilter.tag);
    }
}
