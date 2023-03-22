import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { FuseSharedModule } from '@fuse/shared.module';

import { MailConfirmComponent } from 'app/main/pages/authentication/mail-confirm/mail-confirm.component';
import {AccountActivationComponent} from "./account-activation.component";

const routes = [
    {
        path     : 'auth/activate',
        component: AccountActivationComponent
    }
];

@NgModule({
    declarations: [
        AccountActivationComponent
    ],
    exports: [
        AccountActivationComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,

        FuseSharedModule
    ]
})
export class AccountActivationModule
{
}
