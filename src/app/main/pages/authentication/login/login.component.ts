import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {FuseConfigService} from '@fuse/services/config.service';
import {fuseAnimations} from '@fuse/animations';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {AuthenticationService} from "../../../../services/authentication.service";
import {first} from 'rxjs/operators';
import {ActivatedRoute, Router} from "@angular/router";
import {DialogOption, FuseDialogService} from "../../../../../@fuse/services/dialog.service";
import {FuseSplashScreenService} from "../../../../../@fuse/services/splash-screen.service";
import {TokenStorageService} from "../../../../services/token.service";
import {isNullOrEmpty} from "../../../../fuse-config";
import Swal from "sweetalert2";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    error: any;
    returnUrl: string

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     * @param authenticationService
     * @param router
     * @param _dialog
     * @param _fuseSplashScreenService
     * @param tokenStorage
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private authenticationService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
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
                    hidden: true
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
        this.route.queryParams.subscribe(queryParams => {
            if (!isNullOrEmpty(queryParams['returnUrl'])) {
                this.returnUrl = queryParams['returnUrl'];
            }
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
    }

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
                       // console.log(data);
                        this._fuseSplashScreenService.hide();
                        if (data.roles.indexOf('ROLE_ADMIN') > -1) {
                            if (!isNullOrEmpty(this.returnUrl)) {
                                this.router.navigate([this.returnUrl]);
                            } else {
                                this.router.navigate(['/admin/questions']);
                            }
                        } else {
                            this.router.navigate(['/home']);
                        }
                    }
                },
                error => {
                    this._fuseSplashScreenService.hide();
                });
    }
}
