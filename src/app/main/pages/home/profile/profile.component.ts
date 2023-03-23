import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { FuseConfigService } from "../../../../../@fuse/services/config.service";
import { HomeService } from "../home.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthenticationService } from "../../../../services/authentication.service";
import { FuseDialogService } from "../../../../../@fuse/services/dialog.service";
import { TokenStorageService } from "../../../../services/token.service";
import { User } from "../../../../models/user";
import { CommonService } from "../../../../services/common.service";
import { isNullOrEmpty } from "../../../../fuse-config";
import { map } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

import { ProfileService } from "./profile.service";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../admin/user/users/users.service';
import { Console } from 'console';
import { DataLayerManager } from '@agm/core';
import { IconSnackBarComponent } from '@fuse/components/icon-snack-bar/icon-snack-bar.component';
import { UserService } from '../../admin/user/user/user.service';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ProfileComponent implements OnInit, OnDestroy {
    currentUser: User;
    user: User;
    aux: any;
    editing: boolean = false;
    userForm: FormGroup;
    emailForm: FormGroup;
    passwordForm: FormGroup;
    objetoJson: any;
    // Private
    private _unsubscribeAll: Subject<any>;
    data$: Observable<any>;
    profile$: Observable<any>;
    type: string;
    mode = 'VIEW';
    onUserChanged: BehaviorSubject<any>;
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

    readonly USERTABS = this._profileService.USERTABS;
    readonly PROFILETABS = this._profileService.PROFILETABS;

    /**
     * Constructor
     *
     * @param _fuseConfigService
     * @param {HomeService} _faqService
     * @param commonService
     * @param router
     * @param _authenticationService
     * @param fuseDialogService
     * @param tokenStorage
     * @param _matSnackBar
     * @param {ProfileService} profileService
     * @param {FormBuilder} _formBuilder
     * @param {Location} _location
     * @param {MatSnackBar} _matSnackBar
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _faqService: HomeService,
        private commonService: CommonService,
        private homeService: HomeService,
        private router: Router,
        private _authenticationService: AuthenticationService,
        public fuseDialogService: FuseDialogService,
        private tokenStorage: TokenStorageService,
        private _matSnackBar: MatSnackBar,
        private _route: ActivatedRoute,
        private _profileService: ProfileService,
        private _formBuilder: FormBuilder,
        private _userService: UsersService,
        private userService: UserService,

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
    loading = false;
    public archivos: any = [];
    verificar = false;
    public imagenPrevia = "./assets/images/user2.png";
    valor_button = "Selecione archivo";
    /**
     * On init
     */
    ngOnInit(): void {
        this.data$ = this.homeService.data$;
        this.type = this.USERTABS[0].ARG;
        this._authenticationService.currentUser.subscribe((user) => {
            this.currentUser = !isNullOrEmpty(user) ? user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.tokenStorage.getUser() : null;
            //      console.log(this.currentUser);


        });
        this._route.queryParams.subscribe(params => {
           // console.log(this.currentUser);
            if (!isNullOrEmpty(params['type']) && params['type'] == 'edit') {
                this.mode = 'EDIT';
                if (!isNullOrEmpty(this.currentUser)) {

                    //    this.aux = this.userService.getUser2(this.currentUser.id);
                    //    console.log(this.onUserChanged);
                    //    console.log('hola')
                    // console.log(this.currentUser);
                    this.user = this.currentUser;
                    this.userForm = this.createForm();
                    this.emailForm = this.createFormEmail();
                    this.passwordForm = this.createFormPassword();
                    sessionStorage.removeItem('content');
                }
            } else if (!isNullOrEmpty(params['type']) && params['type'] == 'view') { 
                if (!sessionStorage.getItem('content')) {
                    window.location.reload();
                    sessionStorage.setItem('content', 'true');
                }
            }
        });
        this.profile$ = this._route.data
            .pipe(map(data => {
                this.commonService.setProfileHeaderInfo(data['profile']);
                return data['profile'];
            }));

    }
    createForm(): FormGroup {
        return this._formBuilder.group({
            id: [this.user.id],
            name: [this.user.name, Validators.compose([Validators.required])],
            username: [this.user.username, Validators.compose([Validators.required])],
            lastName: [this.user.lastName, Validators.compose([Validators.required])],
            'file': [''],
            'fileUp': [''],

        });
    }
    //  const capturado = event.target.files[0];

    createFormPassword(): FormGroup {
        return this._formBuilder.group({
            id: [this.user.id],
            password: [this.user.email, Validators.compose([Validators.required])],
            rpassword: [this.user.email, Validators.compose([Validators.required])],
        });
    }
    createFormEmail(): FormGroup {
        return this._formBuilder.group({
            id: [this.user.id],
            email: [this.user.email, Validators.compose([Validators.required, Validators.email])],
        });
    }
    actionTab(type) {
        this.type = type;
        switch (type) {
            case this.USERTABS[1].ARG:
            case this.USERTABS[4].ARG:
                this.homeService.goTo(this.type, true);
                break;
            case this.USERTABS[2].ARG:
            case this.USERTABS[3].ARG:
                this.homeService.goToAnswers(this.type, true);
                break;
        }

        return false;
    }
    changeFile(file: any) {
        if (file.target.files && file.target.files[0]) {
            if (file.target.files[0].size > 10000000) {
                this.userForm.controls['file'].setErrors({ 'maxFileSize': true });
                this.userForm.controls['file'].markAsTouched();
                return;
            } else if (['image/jpeg', 'image/png', 'image/jpg'].indexOf(file.target.files[0].type) == -1) {
                this.userForm.controls['file'].setErrors({ 'typeError': true });
                this.userForm.controls['file'].markAsTouched();
                return;
            } else {
                const capturado = file.target.files[0];
                // this.form.get('imagen')?.setValue(capturado);   
                const reader = new FileReader();
                if (capturado.type.includes('image')) {
                    //console.log('Si es una imagen');
                    this.archivos.push(capturado);
                    reader.onload = () => this.imagenPrevia = reader.result as string;
                    reader.readAsDataURL(capturado)
                    this.verificar = true;
                } else {
                    this.verificar = false;
                    this.imagenPrevia = "./assets/img/cancel.png";
                    //console.log(this.imagenPrevia);
                }
                //  console.log(file.target.files[0]);
                this.valor_button = file.target.files[0].name;
                //   this.userForm.controls['file'].setValue(file.target.files[0]);
                // this.userForm.controls['fileUp'].setValue(file.target.files[0]);
            }

            this.fileInput.nativeElement.value = "";
        }
    }
    saveEmail() {
        const data = this.emailForm.getRawValue();
        const userEmail = {
            "id": data.id,
            "userName": this.user.username,
            "username": this.user.username,
            "name": this.user.name,
            "lastName": this.user.lastName,
            "email": data.email,
            "roles": this.user.roles,
            "enabled": true
        }

        this.userService.saveUser(userEmail).pipe(takeUntil(this._unsubscribeAll))
            .subscribe(res => {
                const userAux = {
                    "refreshToken": this.currentUser["refreshToken"],
                    "id": this.user.id,
                    "username": this.user.username,
                    "email": data.email,
                    "fullName": this.user.name + this.user.lastName,
                    "name": this.user.name,
                    "lastName": this.user.lastName,
                    "roles":
                        this.currentUser["roles"]
                    ,
                    "tokenType": "Bearer",
                    "accessToken": this.currentUser["accessToken"]
                }
                // this.userService.onUserChanged.next(res);
                this.tokenStorage.saveUser(userAux);
                this._authenticationService.setCurrentUserSubject(userAux);
                this._matSnackBar.open('Correo actualizado', 'OK', {
                    verticalPosition: 'top',
                    duration: 2000
                });
                //  this._router.navigate(['/admin/users']);
            },
                error => {
                    if (error.status == 400) {
                        this.userForm.markAllAsTouched();
                    }
                });
        //  console.log(data);
    }
    savePassword() {
        const data = this.passwordForm.getRawValue();
        console.log(data.password);
        const userPassword = {
            "id": data.id,
            "userName": this.user.username,
            "username": this.user.username,
            "name": this.user.name,
            "lastName": this.user.lastName,
            "email": this.user.email,
            "roles": this.user.roles,
            "password": data.password,
            "enabled": true
        }
        if (data.password != data.rpassword) {
            this._matSnackBar.openFromComponent(IconSnackBarComponent, {
                duration: 3000,
                verticalPosition: 'top',
                data: {
                    message: "Las contraseñas no coinciden.",
                    icon: 'wifi_off'
                }
            });
        } else {
            this.userService.updatePassword(userPassword).pipe(takeUntil(this._unsubscribeAll))
                .subscribe(res => {
                    const userAux = {
                        "refreshToken": this.currentUser["refreshToken"],
                        "id": this.currentUser.id,
                        "username": this.user.username,
                        "email": this.currentUser["email"],
                        "fullName": this.user.name + this.user.lastName,
                        "name": this.user.name,
                        "lastName": this.user.lastName,
                        "roles":
                            this.currentUser["roles"]
                        ,
                        "tokenType": "Bearer",
                        "accessToken": this.currentUser["accessToken"]
                    }
                    // this.userService.onUserChanged.next(res);
                    this.tokenStorage.saveUser(userAux);
                    this._authenticationService.setCurrentUserSubject(userAux);
                    // Show the success message
                    this._matSnackBar.open('Contraseña actualizada', 'OK', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    //  this._router.navigate(['/admin/users']);
                },
                    error => {
                        console.log(error.error);

                        if (error.status == 400) {
                            this.userForm.markAllAsTouched();
                        }
                    });
        }
        // console.log(data);
    }
    saveProfile() {
        // const imageToBase64 = require('image-to-base64');
        const data = this.userForm.getRawValue();
        // console.log(data);
        const userImage = {
            "id": data.id,
            "userName": data.username,
            "username": data.username,
            "name": data.name,
            "lastName": data.lastName,
            "email": this.user.email,
            "roles": this.user.roles,
            "enabled": true,
            "avatar": this.archivos[0]
        }

        if (userImage.avatar == undefined) {
            console.log('hola');
            const userSave = {
                "id": data.id,
                "userName": data.username,
                "username": data.username,
                "name": data.name,
                "lastName": data.lastName,
                "email": this.user.email,
                "roles": this.user.roles,
                "enabled": true,
                "fileEncode": this.user.fileEncode
            }
            this.userService.saveUser(userSave).pipe(takeUntil(this._unsubscribeAll))
                .subscribe(res => {
                    this.saveImage(data, userImage);
                },
                    error => {
                        if (error.status == 400) {
                            this.userForm.markAllAsTouched();
                        }
                    });
        } else {
            this.userService.updateImage(userImage).pipe(takeUntil(this._unsubscribeAll))
                .subscribe(res => {
                    console.log('hola2');
                    this.archivos.splice(0, 1);
                    this.imagenPrevia = "./assets/images/user2.png";
                    this.valor_button = "Selecione archivo";
                    this.saveImage(data,userImage);
                },
                    error => {
                        console.log(error.error);

                        if (error.status == 400) {
                            this.userForm.markAllAsTouched();
                        }
                    });
        }

        //  this.userService.updateImage(userImage);

        // this._matSnackBar.open('Usuario actualizado', 'OK', {
        //     verticalPosition: 'top',
        //     duration: 2000
        // });


      

        // console.log(data);
    }
    saveImage(data: any, userImage: any) { 
        this.userService.getById(userImage.id).subscribe({
            next: (c) => {
                this.objetoJson = c;
                //  console.log(this.objetoJson.fileEncode);
                const userAux = {
                    "refreshToken": this.currentUser["refreshToken"],
                    "id": this.currentUser.id,
                    "username": data.username,
                    "email": this.currentUser["email"],
                    "fileEncode": this.objetoJson.fileEncode,
                    "fullName": data.name + data.lastName,
                    "name": data.name,
                    "lastName": data.lastName,
                    "roles":
                        this.currentUser["roles"],
                    "tokenType": "Bearer",
                    "accessToken": this.currentUser["accessToken"]
                }
                this.tokenStorage.saveUser(userAux);
                this._authenticationService.setCurrentUserSubject(userAux);
                // Show the success message
                this._matSnackBar.open('Usuario actualizado', 'OK', {
                    verticalPosition: 'top',
                    duration: 2000
                });
            },
            error: (err) => {
                if (err.status == 400 || err.status == 409) {
                    console.log(err.error.message);
                }
            }
        });
    }
    onScroll() {
        this.actionTab(this.type);
    }

    changeMode(mode) {
        this.mode = mode;     
        return false;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}