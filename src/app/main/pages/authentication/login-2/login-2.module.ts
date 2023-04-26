import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';

import { Login2Component } from 'app/main/pages/authentication/login-2/login-2.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ForgotPassword2Module } from '../forgot-password-2/forgot-password-2.module';

const routes = [
    {
        path     : 'auth/login-2',
        component: Login2Component
    }
];

@NgModule({
    declarations: [
        Login2Component
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ForgotPassword2Module,

        FuseSharedModule
    ]
   
})
export class Login2Module
{
}
