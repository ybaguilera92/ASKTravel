import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { FuseUtils } from '@fuse/utils';

import {EnviromentsService} from "../../../../services/enviroments.service";
import {FuseSplashScreenService} from "../../../../../@fuse/services/splash-screen.service";
import {isNullOrEmpty} from "../../../../fuse-config";
import {DialogOption, FuseDialogService} from "../../../../../@fuse/services/dialog.service";
import {Todo} from "./todo.model";
import {CommonService} from "../../../../services/common.service";
import {DomSanitizer} from "@angular/platform-browser";
import Swal from "sweetalert2";
import {QuestionFilter} from "./sidebars/main/filter.model";


@Injectable()
export class TodoService implements Resolve<any>
{
    todos: Todo[];
    selectedTodos: Todo[];
    currentTodo: Todo;
    searchText: string;
    filters: any[];
    tags: any[];
    categories: any[];
    routeParams: any;
    private _status: string;
    private _tag: string;
    private _questionFilter: QuestionFilter;

    onTodosChanged: BehaviorSubject<any>;
    onSelectedTodosChanged: BehaviorSubject<any>;
    onCurrentTodoChanged: BehaviorSubject<any>;
    onFiltersChanged: BehaviorSubject<any>;
    onTagsChanged: BehaviorSubject<any>;
    onSearchTextChanged: BehaviorSubject<any>;
    onNewTodoClicked: Subject<any>;
    onCategoriesChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     * @param {Location} _location
     */
    constructor(
        private _httpClient: HttpClient,
        private _location: Location,
        private environment: EnviromentsService,
        private _dialog: FuseDialogService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private _commonService: CommonService,
        private _domSanitizer: DomSanitizer
    )
    {
        // Set the defaults
        this.selectedTodos = [];
        this.searchText = '';
        this.onTodosChanged = new BehaviorSubject([]);
        this.onSelectedTodosChanged = new BehaviorSubject([]);
        this.onCurrentTodoChanged = new BehaviorSubject([]);
        this.onFiltersChanged = new BehaviorSubject([]);
        this.onTagsChanged = new BehaviorSubject([]);
        this.onCategoriesChanged = new BehaviorSubject([]);
        this.onSearchTextChanged = new BehaviorSubject('');
        this.onNewTodoClicked = new Subject();
        this._questionFilter = new QuestionFilter();
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getCatalogs(),
                this.getTodos()
            ]).then(
                () => {
                    if ( this.routeParams.todoId )
                    {
                        this.setCurrentTodo(this.routeParams.todoId);
                    }
                    else
                    {
                        this.setCurrentTodo(null);
                    }

                    this.onSearchTextChanged.subscribe(searchText => {
                        if ( !isNullOrEmpty(searchText) ) {
                            this.searchText = searchText;
                            this.getTodos();
                        }
                    });
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get todos
     *
     * @returns {Promise<Todo[]>}
     */
    getTodos(): Promise<Todo[]>
    {
        if ( this.routeParams.tagHandle )
        {
            return this.getTodosByTag(this.routeParams.tagHandle);
        }

        if ( this.routeParams.filterHandle )
        {
            return this.getTodosByFilter(this.routeParams.filterHandle);
        }

        return this.getTodosByParams(new HttpParams()
            .set('type', 'ALL')
            .set('pageNo', this.questionFilter.pageNo.toString())
            .set('pageSize', this.questionFilter.pageSize.toString())

        );
    }

    /**
     * Get todos by params
     *
     * @param handle
     * @returns {Promise<Todo[]>}
     */
    getTodosByParams(params:HttpParams): Promise<Todo[]>
    {
        return new Promise((resolve, reject) => {

            this._httpClient.get(`${this.environment.getEnviroment().apiUrl}/questions/`, {params})
                .subscribe((data: any) => {
                    this.todos = data['questions'].map( question => {
                        if(!isNullOrEmpty(question.fileEncode)){
                            question.fileEncode = this._domSanitizer.bypassSecurityTrustUrl("data:image/png;base64, "+ question.fileEncode);
                        }
                        return new Todo(question);
                    });


                    data.questions = this.todos;

                    this.todos = FuseUtils.filterArrayByString(this.todos, this.searchText);

                    this.onTodosChanged.next(data);

                    resolve(this.todos);
                });
        });
    }

    /**
     * Get todos by filter
     *
     * @param handle
     * @returns {Promise<Todo[]>}
     */
    getTodosByFilter(handle): Promise<Todo[]>
    {

        let param = handle + '=true';

        if ( handle === 'dueDate' )
        {
            param = handle + '=^$|\\s+';
        }

        return new Promise((resolve, reject) => {

            this._httpClient.get('api/todo-todos?' + param)
                .subscribe((todos: any) => {

                    this.todos = todos.map(todo => {
                        return new Todo(todo);
                    });

                    this.todos = FuseUtils.filterArrayByString(this.todos, this.searchText);

                    this.onTodosChanged.next(this.todos);

                    resolve(this.todos);

                }, reject);
        });
    }

    /**
     * Get todos by tag
     *
     * @param handle
     * @returns {Promise<Todo[]>}
     */
    getTodosByTag(handle): Promise<Todo[]>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.get('api/todo-tags?handle=' + handle)
                .subscribe((tags: any) => {

                    const tagId = tags[0].id;

                    this._httpClient.get('api/todo-todos?tags=' + tagId)
                        .subscribe((todos: any) => {

                            this.todos = todos.map(todo => {
                                return new Todo(todo);
                            });

                            this.todos = FuseUtils.filterArrayByString(this.todos, this.searchText);

                            this.onTodosChanged.next(this.todos);

                            resolve(this.todos);

                        }, reject);
                });
        });
    }

    /**
     * Toggle selected todo by id
     *
     * @param id
     */
    toggleSelectedTodo(id): void
    {
        // First, check if we already have that todo as selected...
        if ( this.selectedTodos.length > 0 )
        {
            for ( const todo of this.selectedTodos )
            {
                // ...delete the selected todo
                if ( todo.id === id )
                {
                    const index = this.selectedTodos.indexOf(todo);

                    if ( index !== -1 )
                    {
                        this.selectedTodos.splice(index, 1);

                        // Trigger the next event
                        this.onSelectedTodosChanged.next(this.selectedTodos);

                        // Return
                        return;
                    }
                }
            }
        }

        // If we don't have it, push as selected
        this.selectedTodos.push(
            this.todos.find(todo => {
                return todo.id === id;
            })
        );

        // Trigger the next event
        this.onSelectedTodosChanged.next(this.selectedTodos);
    }

    /**
     * Toggle select all
     */
    toggleSelectAll(): void
    {
        if ( this.selectedTodos.length > 0 )
        {
            this.deselectTodos();
        }
        else
        {
            this.selectTodos();
        }

    }

    /**
     * Select todos
     *
     * @param filterParameter
     * @param filterValue
     */
    selectTodos(filterParameter?, filterValue?): void
    {
        this.selectedTodos = [];

        // If there is no filter, select all todos
        if ( filterParameter === undefined || filterValue === undefined )
        {
            this.selectedTodos = this.todos;
        }
        else
        {
            this.selectedTodos.push(...
                this.todos.filter(todo => {
                    return todo[filterParameter] === filterValue;
                })
            );
        }

        // Trigger the next event
        this.onSelectedTodosChanged.next(this.selectedTodos);
    }

    /**
     * Deselect todos
     */
    deselectTodos(): void
    {
        this.selectedTodos = [];

        // Trigger the next event
        this.onSelectedTodosChanged.next(this.selectedTodos);
    }

    /**
     * Set current todo by id
     *
     * @param id
     */
    setCurrentTodo(id): void
    {
        this.currentTodo = this.todos.find(todo => {
            return todo.id === id;
        });

        this.onCurrentTodoChanged.next([this.currentTodo, 'edit']);

        const tagHandle    = this.routeParams.tagHandle,
              filterHandle = this.routeParams.filterHandle;

        if ( tagHandle )
        {
            this._location.go('apps/todo/tag/' + tagHandle + '/' + id);
        }
        else if ( filterHandle )
        {
            this._location.go('apps/todo/filter/' + filterHandle + '/' + id);
        }
        else
        {
            this._location.go('admin/question/' + id);
        }
    }

    /**
     * Set current todo by id
     *
     * @param id
     */
    findQuestionsByFilter(){

        if(!isNullOrEmpty(this.questionFilter.status) && !isNullOrEmpty(this.questionFilter.tag)){

            this.getTodosByParams(new HttpParams()
                .set('pageNo', this.questionFilter.pageNo.toString())
                .set('pageSize', this.questionFilter.pageSize.toString())
                .set('status', this.questionFilter.status)
                .set('tag', this.questionFilter.tag)
                .set('type', 'BY_TAG_STATUS')
            )
        }
        else if (!isNullOrEmpty(this.questionFilter.status) && isNullOrEmpty(this.questionFilter.tag)){

            this.getTodosByParams(new HttpParams()
                .set('pageNo', this.questionFilter.pageNo.toString())
                .set('pageSize', this.questionFilter.pageSize.toString())
                .set('status', this.questionFilter.status)
                .set('type', 'BY_STATUS')
            )
        }
        else if(isNullOrEmpty(this.questionFilter.status) && !isNullOrEmpty(this.questionFilter.tag)){

            this.getTodosByParams(new HttpParams()
                .set('pageNo', this.questionFilter.pageNo.toString())
                .set('pageSize', this.questionFilter.pageSize.toString())
                .set('tag', this.questionFilter.tag)
                .set('type', 'BY_TAG')
            )
        } else {
            this.getTodosByParams(new HttpParams()
                .set('pageNo', this.questionFilter.pageNo.toString())
                .set('pageSize', this.questionFilter.pageSize.toString())
                .set('type', 'ALL')
            )
        }
    }

    /**
     * Toggle tag on selected todos
     *
     * @param tagId
     */
    toggleTagOnSelectedTodos(tagId): void
    {
        this.selectedTodos.map(todo => {
            this.toggleTagOnTodo(tagId, todo);
        });
    }

    /**
     * Toggle tag on todo
     *
     * @param tagId
     * @param todo
     */
    toggleTagOnTodo(tagId, todo): void
    {
        const index = todo.tags.findIndex(tag => tag.id === tagId);

        if ( index !== -1 )
        {
            todo.tags.splice(index, 1);
        }
        else
        {
            todo.tags.push(this.tags.find((tag) => tag.id === tagId));
        }

    }

    /**
     * Toggle status on todo
     *
     * @param statusParams
     * @param todo
     */
    toggleStatusOnTodo (statusValue, todo, statusParams = 'id'): void
    {
        const index = todo.status.findIndex(status => status[statusParams] === statusValue);

        if ( index !== -1 )
        {
            todo.status.splice(index, 1);
        }
        else
        {
            todo.status.push(this.filters.find((status) => status[statusParams] === statusValue));
        }

    }


    /**
     * Has tag?
     *
     * @param tagId
     * @param todo
     * @returns {boolean}
     */
    hasTag(tagId, todo): any
    {
        if ( !todo.tags || todo.tags.length == 0  )
        {
            return false;
        }

        return todo.tags.findIndex(tag => tag.id === tagId) !== -1;
    }

    /**
     * Update the todo
     *
     * @param todo
     * @returns {Promise<any>}
     */
    updateTodo(todo, fromList = false): any
    {
        this._fuseSplashScreenService.show();
        return new Promise((resolve, reject) => {

            const params = this.createFormData(todo);
            const httpHeaders = new HttpHeaders({
                "enctype": "multipart/form-data",
            });
            const options = {
                headers: httpHeaders
            };

            this._httpClient.put(`${this.environment.getEnviroment().apiUrl}/questions`, params, options)
                .subscribe(response => {
                    if(response){
                        this._fuseSplashScreenService.hide();
                        Swal.fire({
                            title: 'Estimado Usuario',
                            text: 'Actualización satisfactoria',
                            icon: 'success'
                        }).then(confirmed => {
                            if(confirmed){
                                this.onNewTodoClicked.next(true);
                            }
                        })
                    }
                    this.getTodos().then(todos => {
                        resolve(todos);
                    }, reject);
                },
                error => {
                    this._fuseSplashScreenService.hide();
                    Swal.fire({
                        title: 'Estimado Usuario',
                        text: 'Ha ocurrido un error, inténtelo más tarde',
                        icon: 'error'
                    }).then(confirmed => {
                        if(confirmed){
                            this.onCurrentTodoChanged.next([null, null]);
                        }
                    })
                });
        });
    }

    /**
     * Create the todo
     *
     * @param todo
     * @returns {Promise<any>}
     */
    createTodo(todo): any
    {
        this._fuseSplashScreenService.show();
        return new Promise((resolve, reject) => {

            const params = this.createFormData(todo);
            const httpHeaders = new HttpHeaders({
                "enctype": "multipart/form-data",
            });
            const options = {
                headers: httpHeaders
            };

            this._httpClient.post(`${this.environment.getEnviroment().apiUrl}/questions`, params, options)
                .subscribe(response => {
                        if(response){
                            this._fuseSplashScreenService.hide();
                            Swal.fire({
                                title: 'Estimado Usuario',
                                text: 'Operación satisfactoria',
                                icon: 'success'
                            }).then(confirmed => {
                                if(confirmed){
                                    this.onNewTodoClicked.next(true);
                                    this.getTodos().then(todos => {
                                        resolve(todos);
                                    }, reject);
                                }
                            })
                        }
                    },
                    error => {
                        this._fuseSplashScreenService.hide();
                        Swal.fire({
                            title: 'Estimado Usuario',
                            text: 'Ha ocurrido un error, inténtelo más tarde',
                            icon: 'error'
                        }).then(confirmed => {
                            if(confirmed){
                                this.onCurrentTodoChanged.next([null, null]);
                            }
                        })
                    });
        });
    }

    private getCatalogs() {
        this._commonService.getCatalogs(['TABLA_TAGS', 'TABLA_STATUS', 'TABLA_CATEGORIES']).subscribe(data => {
            this.tags = data['TABLA_TAGS'];
            this.onTagsChanged.next(this.tags);
            this.filters = data['TABLA_STATUS'];
            this.onFiltersChanged.next(this.filters);
            this.categories = data['TABLA_CATEGORIES'];
            this.onCategoriesChanged.next(this.categories);
        });
    }

    private createFormData(todo): FormData{
        let params = new FormData();
        params.append('file', new Blob([todo.fileUp],
            {
                type: "multipart/form-data"
            }),todo.fileUp.name);

        params.append('data', new Blob([JSON.stringify({
            "id": todo.id,
            "title": todo.title,
            "description": todo.description,
            "tags": todo.tags,
            "category": this.categories.find( cat => cat.id == todo.category),
            "status": todo.status,
            "answer": {
                id: !isNullOrEmpty(todo.answer.id) ? todo.answer.id : null,
                title: todo.title,
                description: !isNullOrEmpty(todo.answer.description) ? todo.answer.description : todo.answer,
                user: {
                    id: todo.follower
                }
            },
            "follower": todo.follower,
        })], {
            type: "application/json"
        }));

        return params;
    }

    public get status(){
        return this._status;
    }

    public set status(status){
        this._status = status;
    }

    public get tag(){
        return this._status;
    }

    public set tag(tag){
        this._tag = tag;
    }

    public get questionFilter(){
        return this._questionFilter;
    }

    public set questionFilter(questionFilter){
        this._questionFilter = questionFilter;
    }

}
