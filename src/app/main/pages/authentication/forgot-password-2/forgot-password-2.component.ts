import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { Login2Component } from '../login-2/login-2.component';
import { FuseDialogService } from '@fuse/services/dialog.service';
import { AuthenticationService } from 'app/services/authentication.service';
import { Router } from '@angular/router';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { TokenStorageService } from 'app/services/token.service';
import { first } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { interval } from 'rxjs';

@Component({
    selector     : 'forgot-password-2',
    templateUrl  : './forgot-password-2.component.html',
    styleUrls    : ['./forgot-password-2.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ForgotPassword2Component implements OnInit
{
    forgotPasswordForm: FormGroup;
    error: any;
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private authenticationService: AuthenticationService,
        private router: Router,
        private _dialog: FuseDialogService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private tokenStorage: TokenStorageService
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
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
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }
    goToSignUp() {
        this._dialog.buildDialogStyle(Login2Component, {
            width: '850px'
        });
    }
    get f() { return this.forgotPasswordForm.controls; }

    onSubmit() {

        // stop here if form is invalid
        if (this.forgotPasswordForm.invalid) {
            return;
        }

        this._fuseSplashScreenService.show();
        this.authenticationService.recovery(this.forgotPasswordForm.getRawValue())
            .pipe(first())
            .subscribe(
                data => {
                    // if (data.accessToken == "Usuario inactivo") {
                        Swal.fire({
                            title: 'Atención',
                            text: "Se ha enviado la nueva contraseña a su correo electrónico.",
                            icon: 'info'
                        })
                   
                        const numbers = interval(2500);
                        const takeFourNumbers = numbers.pipe();
                        takeFourNumbers.subscribe(x =>
                            window.location.reload()
                        );
                   
                       this._fuseSplashScreenService.hide();
                    // } else {

                     //   this.tokenStorage.saveUser(data);
                       // this._fuseSplashScreenService.hide();
                       // this._dialog.close();
                      //  window.location.reload();
                        // console.log(this.tokenStorage.getUser());
                    
                },
                error => {
                    this.error = error;
                    let message = '';                    
                    this._fuseSplashScreenService.hide();
                    Swal.fire({
                        title: 'Correo no existe!!',
                        text: message,
                        icon: 'error'
                    });
                });

    }
}
