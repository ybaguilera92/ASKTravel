import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { takeUntil } from 'rxjs/operators';
import {PageEvent} from "@angular/material/paginator";
import {Todo} from "../todo.model";
import {TodoService} from "../todo.service";
import {isNullOrEmpty} from "../../../../../fuse-config";
import {HttpParams} from "@angular/common/http";


@Component({
    selector     : 'todo-list',
    templateUrl  : './todo-list.component.html',
    styleUrls    : ['./todo-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class TodoListComponent implements OnInit, OnDestroy
{
    todos: Todo[];
    currentTodo: Todo;
    length = 100;
    pageSize = 10;
    pageIndex = 10;
    pageSizeOptions: number[] = [];
    pageEvent: PageEvent;
    loading = true;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {TodoService} _todoService
     * @param {Location} _location
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _todoService: TodoService,
        private _location: Location
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
        // Subscribe to update todos on changes
        this._todoService.onTodosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                this.loading = false;
                this.length = data.totalItems;
                this.pageSize = data.currentPage;
                this.todos = data.questions;
                this.todos.map( (todo) => {
                    if(!isNullOrEmpty(todo.status)){
                        Object.keys(todo.status).forEach( key => {
                            if(todo.status[key].tablaDescription === 'Destacada'){
                                todo.starred = true;
                            }
                            else if(todo.status[key].tablaDescription === 'Priorizada'){
                                todo.important = true;
                            }
                        })
                    }
                })
                this.pageIndex = data.currentPage;

                for (let i = 1; i <= data.totalPages; i++){
                    this.pageSizeOptions.push(i * 10);
                }
                this.loading = true;
            });

        // Subscribe to update current todo on changes
        this._todoService.onCurrentTodoChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(currentTodo => {
                if ( !currentTodo )
                {
                    // Set the current todo id to null to deselect the current todo
                    this.currentTodo = null;

                    // Handle the location changes
                    const tagHandle    = this._activatedRoute.snapshot.params.tagHandle,
                          filterHandle = this._activatedRoute.snapshot.params.filterHandle;

                    if ( tagHandle )
                    {
                        this._location.go('apps/todo/tag/' + tagHandle);
                    }
                    else if ( filterHandle )
                    {
                        this._location.go('apps/todo/filter/' + filterHandle);
                    }
                    else
                    {
                        this._location.go('apps/todo/all');
                    }
                }
                else
                {
                    this.currentTodo = currentTodo;
                }
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
     * Read todo
     *
     * @param todoId
     */
    readTodo(todoId): void
    {
        // Set current todo
        this._todoService.setCurrentTodo(todoId);
    }

    /**
     * On drop
     *
     * @param ev
     */
    onDrop(ev): void
    {

    }

    getServerData(event?: PageEvent) {
        this._todoService.questionFilter.pageNo = event.pageIndex;
        this._todoService.questionFilter.pageSize = event.pageSize;
        this._todoService.findQuestionsByFilter();
    }
}
