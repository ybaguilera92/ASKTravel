import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';

import {isNullOrEmpty} from "../../../../../fuse-config";
import {Todo} from "../todo.model";
import {TodoService} from "../todo.service";
import {User} from "../../../../../models/user";
import {AuthenticationService} from "../../../../../services/authentication.service";
import {TokenStorageService} from "../../../../../services/token.service";


@Component({
    selector     : 'todo-details',
    templateUrl  : './todo-details.component.html',
    styleUrls    : ['./todo-details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class TodoDetailsComponent implements OnInit, OnDestroy
{
    todo: Todo;
    tags: any[];
    categories: any[];
    filters: any[];
    formType: string;
    todoForm: FormGroup;
    clearFile:boolean;
    imgPreview: any;
    showPreview: boolean;
    currentUser: User;

    @ViewChild('titleInput', {static: false})
    titleInputField : ElementRef;

    @ViewChild('fileInput', {static: false})
    fileInput: ElementRef;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {TodoService} _todoService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _todoService: TodoService,
        private _formBuilder: FormBuilder,
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

        this._authenticationService.currentUser.subscribe((user) => {
            this.currentUser = !isNullOrEmpty(user) ? user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.tokenStorage.getUser() : null;
        });
        // Subscribe to update the current todo
        this._todoService.onCurrentTodoChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(([todo, formType]) => {

                if ( todo && formType === 'edit' )
                {
                    this.formType = 'edit';
                    todo.answer = todo.answers.find( answer => {
                        if(!isNullOrEmpty(answer) && answer.user.id == this.currentUser.id ){
                            return answer;
                        }
                    });

                    if(isNullOrEmpty(todo.answer)){
                        todo.answer = {}
                    }

                    todo.file = todo.file.title != 'blob' ? todo.file.title : {};
                    todo.completed = !isNullOrEmpty(todo.status.find(status => status.tablaArgumento == 'Atendida'));
                    this.todo = todo;

                    Object.keys(this.todo.status).forEach( key => {
                            if(this.todo.status[key].tablaDescription === 'Destacada'){
                                todo.starred = true;
                            }
                            else if(this.todo.status[key].tablaDescription === 'Priorizada'){
                                todo.important = true;
                            }
                    });

                    this.todoForm = this.createTodoForm();

                    /*this.todoForm.valueChanges
                        .pipe(
                            takeUntil(this._unsubscribeAll),
                            debounceTime(500),
                            distinctUntilChanged()
                        )
                        .subscribe(data => {
                            this._todoService.updateTodo(data);
                        });*/
                }
            });

        // Subscribe to update on tag change
        this._todoService.onTagsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(labels => {
                this.tags = labels;
            });

        // Subscribe to update on categories change
        this._todoService.onCategoriesChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(cats => {
                this.categories = cats;
            });

        // Subscribe to update on tag change
        this._todoService.onFiltersChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(filters => {
                this.filters = filters;
            });

        // Subscribe to update on tag change
        this._todoService.onNewTodoClicked
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.formType = 'create';
                this.todo = new Todo({});
                this.formType = 'new';
                this.todoForm = this.createTodoForm();
                this._todoService.onCurrentTodoChanged.next([this.todo, 'new']);
                setTimeout(() => this.focusTitleField(), 100);
            });

        this.clearFile = false;
        this.showPreview = false;
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
     * Focus title field
     */
    focusTitleField(): void
    {
        setTimeout(() => {
            this.titleInputField.nativeElement.focus();
        });
    }

    /**
     * Create todo form
     *
     * @returns {FormGroup}
     */
    createTodoForm(): FormGroup
    {
        return this._formBuilder.group({
            id       : [!isNullOrEmpty(this.todo.id) ? this.todo.id : null],
            title    : [!isNullOrEmpty(this.todo.title) ? this.todo.title : '', Validators.compose([Validators.required, Validators.minLength(10)])],
            category    : [!isNullOrEmpty(this.todo.category) ? this.todo.category.id : '', [Validators.required]],
            description    : [!isNullOrEmpty(this.todo.description) ? this.todo.description : '', Validators.compose([Validators.required])],
            answer    : [!isNullOrEmpty(this.todo.answer) ? this.todo.answer.description : '',  Validators.compose([Validators.required, Validators.minLength(50)])],
            completed: [this.todo.completed],
            starred  : [this.todo.starred],
            important: [this.todo.important],
            deleted  : [this.todo.deleted],
            tags     : [this.todo.tags],
            status     : [this.todo.status],
            file: [!isNullOrEmpty(this.todo.file) ? this.todo.file.title : ''],
            fileUp: ['']
        });
    }


    /**
     * Toggle Completed
     *
     * @param event
     */
    toggleCompleted(event): void
    {
        event.stopPropagation();
        if(this.todoForm.valid){
            this.todo.toggleCompleted();
            let params = this.todoForm.value;
            params.follower = this.currentUser.id;
            params.status = params.status.filter( status => status.tablaDescription != "Nueva");
            params.status.push(this.filters[2]);
            if(this.formType == 'new'){
                this._todoService.createTodo(params);
            } else {
                params.answer = {
                    id: this.todo.answer.id,
                    title: params.title,
                    description: params.answer,
                    user: {
                        id: params.follower
                    }
                };
                this._todoService.updateTodo(params);
            }

        }
    }

    /**
     * Toggle Deleted
     *
     * @param event
     */
    toggleDeleted(event): void
    {
        event.stopPropagation();
        this.todo.toggleDeleted();
        this._todoService.updateTodo(this.todo);
    }

    /**
     * Toggle tag on todo
     *
     * @param tagId
     */
    toggleTagOnTodo(tagId): void
    {
        this._todoService.toggleTagOnTodo(tagId, this.todo);
    }

    /**
     * Has tag?
     *
     * @param tagId
     * @returns {any}
     */
    hasTag(tagId): any
    {
        return this._todoService.hasTag(tagId, this.todo);
    }

    /**
     * Add todo
     */
    addTodo(): void
    {
        this._todoService.createTodo(this.todoForm.getRawValue());
    }

    toggleStatusOnTodo(status) {
        if(status.tablaArgumento === 'Destacada'){
            this.todo.toggleStar();
        }
        else if(status.tablaArgumento === 'Priorizada'){
            this.todo.toggleImportant();
        }

        this._todoService.toggleStatusOnTodo(status.id, this.todo);
    }

    changeFile(file:any) {

        if (file.target.files && file.target.files[0]) {
            if(file.target.files[0].size > 10000000 ){
                this.todoForm.controls['file'].setErrors({'maxFileSize': true});
                this.todoForm.controls['file'].markAsTouched();
                return;
            } else if(['image/jpeg','image/png','image/jpg'].indexOf(file.target.files[0].type) == -1){
                this.todoForm.controls['file'].setErrors({'typeError': true});
                this.todoForm.controls['file'].markAsTouched();
                return;
            }else {
                this.showPreview = true;
                let reader = new FileReader();
                reader.readAsDataURL(file.target.files[0]);
                reader.onload = (_event) => {
                    this.imgPreview = reader.result;
                }
                this.todoForm.controls['file'].setValue(file.target.files[0].name);
                this.todoForm.controls['fileUp'].setValue(file.target.files[0]);
            }

            this.fileInput.nativeElement.value = "";
        }
    }

    clearFileInput(){
        this.showPreview = true;
        this.todoForm.controls['file'].reset();
        this.todoForm.controls['fileUp'].reset();
    }
}
