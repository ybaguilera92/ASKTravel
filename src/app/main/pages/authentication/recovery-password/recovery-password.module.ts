import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { FuseSharedModule } from '@fuse/shared.module';
import {RecoveryPasswordComponent} from "./recovery-password.component";

const routes = [
    {
        path     : 'auth/recovery-password',
        component: RecoveryPasswordComponent
    }
];

@NgModule({
    declarations: [
        RecoveryPasswordComponent
    ],
    exports: [
        RecoveryPasswordComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,

        FuseSharedModule
    ]
})
export class RecoveryPasswordModule
{
}
