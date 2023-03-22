import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthenticationService } from "../../../../services/authentication.service";
import { Router } from "@angular/router";
import { DialogOption, FuseDialogService } from "../../../../../@fuse/services/dialog.service";
import { FuseSplashScreenService } from "../../../../../@fuse/services/splash-screen.service";
import { TokenStorageService } from "../../../../services/token.service";
import { first } from "rxjs/operators";
import { Register2Component } from "../register-2/register-2.component";
import Swal from "sweetalert2";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'login-2',
    templateUrl: './login-2.component.html',
    styleUrls: ['./login-2.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class Login2Component implements OnInit {
    loginForm: FormGroup;
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
    ) {
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }
        
        this._fuseSplashScreenService.show();
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {                  
                    if (data.accessToken == "Usuario inactivo") {
                        Swal.fire({
                            title: 'Estimado usuario',
                            text: "Su cuenta de usuario aún se encuentra inactiva, revise su correo y actívela haciendo click en el enlace enviado",
                            icon: 'info'
                        })
                        this._fuseSplashScreenService.hide();
                    } else {
                        this.tokenStorage.saveToken(data.accessToken);
                        this.tokenStorage.saveRefreshToken(data.refreshToken);
                        this.tokenStorage.saveUser(data);
                        this._fuseSplashScreenService.hide();
                        this._dialog.close();
                     //   window.location.reload();
                       // console.log(this.tokenStorage.getUser());
                    }
                },
                error => {
                    this.error = error;
                    let message = '';
                    switch (this.error.error.type) {
                        case 'BadCredentialsException':
                            message = 'Credenciales inválidas';
                            break;
                        case 'error':
                            message = 'Ha ocurrido un error inesperado. Verifíque su conexión o contácte a nuestro servicio de asistencia técnica';
                            break
                    }
                    this._fuseSplashScreenService.hide();
                    Swal.fire({
                        title: 'Estimado Usuario',
                        text: message,
                        icon: 'error'
                    });
                });
        
    }

    goToSignIn() {
        this._dialog.buildDialogStyle(Register2Component, {
            width: '850px'
        });
    }
}
