import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import {
    FuseConfirmDialogModule,
    FuseQuestionDialogModule,
    FuseSearchBarModule,
    FuseShortcutsModule
} from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { ToolbarComponent } from 'app/layout/components/toolbar/toolbar.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDialogModule} from "@angular/material/dialog";
import {FuseAskDialogModule} from "../../../../@fuse/components/ask-dialog/ask-dialog.module";
import {FuseConfirmDialogComponent} from "../../../../@fuse/components/confirm-dialog/confirm-dialog.component";
import {FuseQuestionDialogComponent} from "../../../../@fuse/components/question-dialog/question-dialog.component";
import {Login2Component} from "../../../main/pages/authentication/login-2/login-2.component";
import {Login2Module} from "../../../main/pages/authentication/login-2/login-2.module";
import {Register2Component} from "../../../main/pages/authentication/register-2/register-2.component";
import {Register2Module} from "../../../main/pages/authentication/register-2/register-2.module";
import {MatAutocompleteModule} from "@angular/material/autocomplete";

@NgModule({
    declarations: [
        ToolbarComponent
    ],
    imports: [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,

        FuseSharedModule,
        FuseSearchBarModule,
        FuseShortcutsModule,
        MatTooltipModule,
        MatDialogModule,
        FuseAskDialogModule,
        FuseConfirmDialogModule,
        FuseQuestionDialogModule,
        Login2Module,
        Register2Module,
        MatAutocompleteModule
    ],
    exports     : [
        ToolbarComponent
    ],
    entryComponents: [
        FuseConfirmDialogComponent,
        FuseQuestionDialogComponent,
        Login2Component,
        Register2Component
    ],
})
export class ToolbarModule
{
}

export const DIALOG_TYPES = {
    confirmDialog : FuseConfirmDialogComponent,
    alertDialog : FuseConfirmDialogComponent,
    questionDialog: FuseQuestionDialogComponent
};
