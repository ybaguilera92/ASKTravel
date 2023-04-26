import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthenticationService } from "../../../../services/authentication.service";
import { FuseSplashScreenService } from "../../../../../@fuse/services/splash-screen.service";
import { FuseDialogService } from "../../../../../@fuse/services/dialog.service";
import { Login2Component } from "../login-2/login-2.component";
import Swal from 'sweetalert2';

@Component({
    selector: 'register-2',
    templateUrl: './register-2.component.html',
    styleUrls: ['./register-2.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class Register2Component implements OnInit, OnDestroy {
    registerForm: FormGroup;
    isRegister = false;
    user: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private authenticationService: AuthenticationService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private _dialog: FuseDialogService,) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: false
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            name: ['', Validators.compose([Validators.required, Validators.pattern('^[A-ZÑa-zñáéíóúÁÉÍÓÚ° ]+$')])],
            lastName: ['', Validators.compose([Validators.required, Validators.pattern('^[A-ZÑa-zñáéíóúÁÉÍÓÚ° ]+$')])],
            username: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-z0-9._-]{3,16}$/)])],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{5,60}[^'\s]/)]],
            passwordConfirm: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{5,60}[^'\s]/), confirmPasswordValidator]],
            //terms          : ['', [Validators.required]]
        });

        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.registerForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('passwordConfirm').updateValueAndValidity();
            });
    }

    onSubmit() {

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this._fuseSplashScreenService.show();
        this.authenticationService.register(this.registerForm.getRawValue())
            .subscribe(
                data => {
                    Swal.fire({
                        title: 'Atención',
                        text: "Su cuenta de usuario ha sido creada pero se encuentra inactiva, revise su correo y actívela haciendo click en el enlace enviado.",
                        icon: 'info'
                    })
                    this.user = data;
                    this.isRegister = true;
                    this._fuseSplashScreenService.hide();
                    this._dialog.close();
                },
                error => {
                    console.log()
                    if (error.error.message.indexOf("Username is already taken") > -1) {
                        this.registerForm.get('username').setErrors({'unique': true });
                    }
                    if (error.error.message.indexOf("Email is already in use") > -1) {
                        this.registerForm.get('email').setErrors({ 'unique': true });
                    }
                    this._fuseSplashScreenService.hide();
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

    goToSignUp() {
        this._dialog.buildDialogStyle(Login2Component, {
            width: '850px'
        });
    }
}

/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if (!control.parent || !control) {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if (!password || !passwordConfirm) {
        return null;
    }

    if (passwordConfirm.value === '') {
        return null;
    }

    if (password.value === passwordConfirm.value) {
        return null;
    }

    return { passwordsNotMatching: true };
};
