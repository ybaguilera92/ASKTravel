import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AuthenticationService} from "../../../../services/authentication.service";
import {DialogOption, FuseDialogService} from "../../../../../@fuse/services/dialog.service";
import {isNullOrEmpty} from "../../../../fuse-config";
import { Console } from 'console';

@Component({
    selector     : 'recovery-password',
    templateUrl: './recovery-password.component.html',
    styleUrls: ['./recovery-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class RecoveryPasswordComponent implements OnInit, OnDestroy {

    private subscription: Subscription;

    @Input() public email : string;
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _route: ActivatedRoute,
        private _authenticationService: AuthenticationService,
        public _dialog: FuseDialogService,
        public _router: Router
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

    ngOnInit() {
        this.subscription = this._route.queryParams.subscribe(params => {
            if (!isNullOrEmpty(params['code'])) {                
                this._authenticationService.recoverPassword(params['code']).subscribe( res => {
                        let options: DialogOption = {
                            title :'Atención:',
                            message: 'Dirección de correo electrónico confirmada. Revise su correo electrónico para obtener su nueva contraseña.',
                            buttonText : {
                                ok: {
                                    title: 'Iniciar sesión',
                                }
                            },
                            disableClose : true
                        }

                        this._dialog.openDialog(options);
                        this._dialog.confirmed().subscribe(result => {
                            if (result === true) {
                                this._router.navigate(['']);
                            }
                        });
                    },
                    error => {

                    });
            } else {
                this._router.navigate(['auth/recovery-password']);
            }

        });
    }
    
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
