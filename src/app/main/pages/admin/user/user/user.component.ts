import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {fuseAnimations} from '@fuse/animations';

import {UserService} from "./user.service";
import {Router} from "@angular/router";
import {FuseConfigService} from "../../../../../../@fuse/services/config.service";
import {User} from "../../../../../models/user";

;
import {CommonService} from "../../../../../services/common.service";
import {isNullOrEmpty} from "../../../../../fuse-config";

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class UserComponent implements OnInit, OnDestroy {
    user: User;
    editing: boolean = false;
    userForm: FormGroup;
    options = [
        {id: true, desc: 'Activo'},
        {id: false, desc: 'Inactivo'}
    ];
    roles: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {UserService} userService
     * @param {FormBuilder} _formBuilder
     * @param {Location} _location
     * @param {MatSnackBar} _matSnackBar
     */
    constructor(private _fuseConfigService: FuseConfigService,
                private userService: UserService,
                private _formBuilder: FormBuilder,
                private _location: Location,
                private _matSnackBar: MatSnackBar,
                private _router: Router,
                private _commonService: CommonService
    ) {
        // Set the default
        this.user = new User();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: false
                },
                toolbar: {
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
    ngOnInit(): void {
        // Subscribe to update user on changes
        this.userService.onUserChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(user => {
                if(!isNullOrEmpty(user)) {
                    if (user.id != 'new') {
                        this.user = new User(user);
                        this.editing = true;
                    } else {
                        this.editing = false;
                        this.user = new User();
                        this.user.enabled = true;
                    }

                    this.userForm = this.createForm();
                    this.getCatalogs();
                }
            });
    }

    private getCatalogs() {
        this._commonService.getCatalogs(['TABLA_ROLE'])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                this.roles = data['TABLA_ROLE'];
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create user form
     *
     * @returns {FormGroup}
     */
    createForm(): FormGroup {
        if (!this.editing) {
            console.log('hola')
            return this._formBuilder.group({
                username: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
                name: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
                lastName: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50)])],
                password: ['', Validators.compose([Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')])],
                email: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(50)])],
                enabled: ['', Validators.compose([Validators.required])],
                rol: ['', Validators.compose([Validators.required])],
            });
        } else {
            return this._formBuilder.group({
                id: [this.user.id],
                name: [this.user.name, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
                username: [this.user.username, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
                lastName: [this.user.lastName, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(50)])],
                password: ['', Validators.compose([Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')])],
                email: [this.user.email, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(50)])],
                enabled: [this.user.enabled, Validators.compose([Validators.required])],
                rol: [this.user.roles.length > 0 ? this.user.roles[0].name : {}, Validators.compose([Validators.required])],
            });
        }
    }

    /**
     * Save user
     */
    saveUser(): void {

        const data = this.userForm.getRawValue();
        
        this.userService.saveUser({
            "id": data.id,
            "userName": data.username,
            "username": data.username,
            "name": data.name,
            "lastName": data.lastName,
            "email": data.email,
            "roles": [data.rol],
            "enabled": data.enabled
        }).pipe(takeUntil(this._unsubscribeAll))
            .subscribe( res => {
                    this.userService.onUserChanged.next(res);

                    // Show the success message
                    this._matSnackBar.open('Usuario actualizado', 'OK', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    this._router.navigate(['/admin/users']);
                },
                error => {
                    if(error.status == 400){
                        this.userForm.markAllAsTouched();
                    }
                });
    }

    /**
     * Add user
     */
    addUser(): void {
        const data = this.userForm.getRawValue();
        console.log(data.rol)
        this.userService.addUser({
            "password": data.password,
            "userName": data.username,
            "username": data.username,
            "name": data.name,
            "lastName": data.lastName,
            "email": data.email,
            "roles": [data.rol],
            "enabled": data.enabled
        }).pipe(takeUntil(this._unsubscribeAll))
            .subscribe( res => {
                this.userService.onUserChanged.next(data);

                // Show the success message
                this._matSnackBar.open('Usuario adicionado', 'OK', {
                    verticalPosition: 'top',
                    duration: 2000
                });
                this._router.navigate(['/admin/users']);
            },
            error => {
                if(error.status == 400){
                    this.userForm.markAllAsTouched();
                }
            });
    }
}
