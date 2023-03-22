import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { FuseSharedModule } from '@fuse/shared.module';

import {AskComponent} from "./ask.component";
import {AskService} from "./ask.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {AuthGuard} from "../../../helpers/auth.guard";
import {Role} from "../../../models/user";

const routes = [
    {
        path     : 'ask',
        component: AskComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.User, Role.Admin] }
    }
];

@NgModule({
    declarations: [
        AskComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatExpansionModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FuseSharedModule,
        MatAutocompleteModule,
    ],
    providers   : [
        AskService
    ]
})
export class AskModule
{
}
