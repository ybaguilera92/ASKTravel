import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { NgxDnDModule } from '@swimlane/ngx-dnd';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';

import {MatPaginatorModule} from "@angular/material/paginator";
import {MatTooltipModule} from "@angular/material/tooltip";
import {AuthGuard} from "../../../helpers/auth.guard";
import {Role} from "../../../models/user";
import {AdminComponent} from "./admin.component";
import {CatalogsComponent} from "./catalog/catalogs/catalogs.component";
import {CatalogComponent} from "./catalog/catalog/catalog.component";
import {CatalogService} from "./catalog/catalog/catalog.service";
import {CatalogsService} from "./catalog/catalogs/catalogs.service";
import {CatalogModule} from "./catalog/catalog.module";
import {TodoModule} from "./todo/todo.module";
import {TodoComponent} from "./todo/todo.component";
import {TodoService} from "./todo/todo.service";
import {UsersComponent} from "./user/users/users.component";
import {UsersService} from "./user/users/users.service";
import {UserComponent} from "./user/user/user.component";
import {UserService} from "./user/user/user.service";
import {UserModule} from "./user/user.module";

const routes: Routes = [
    {
        path: 'admin',
        children: [
            {
                path     : 'catalogs',
                component: CatalogsComponent,
                resolve  : {
                    data: CatalogsService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin, ]}
            },
            {
                path     : 'catalogs/:id',
                component: CatalogComponent,
                resolve  : {
                    data: CatalogService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin, ]}
            },
            {
                path     : 'catalogs/:id/:handle',
                component: CatalogComponent,
                resolve  : {
                    data: CatalogService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin]}
            },
            {
                path     : 'questions',
                component: TodoComponent,
                resolve  : {
                    todo: TodoService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin, ]}
            },
            {
                path     : 'question/:todoId',
                component: TodoComponent,
                resolve  : {
                    todo: TodoService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin, ]}
            },
            {
                path     : 'question/:filterHandle/:tagHandle',
                component: TodoComponent,
                resolve  : {
                    todo: TodoService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin, ]}
            },
            {
                path     : 'filter/:filterHandle/:todoId',
                component: TodoComponent,
                resolve  : {
                    todo: TodoService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin, ]}
            },
            {
                path     : 'users',
                component: UsersComponent,
                resolve  : {
                    data: UsersService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin, ]}
            },
            {
                path     : 'users/:id',
                component: UserComponent,
                resolve  : {
                    data: UserService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin, ]}
            },
            {
                path     : 'users/:id/:handle',
                component: UserComponent,
                resolve  : {
                    data: UserService
                },
                canActivate: [AuthGuard],
                data: { roles: [Role.Admin]}
            },
        ]
    }
];

@NgModule({
    declarations: [
        AdminComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatSelectModule,

        NgxDnDModule,

        FuseSharedModule,
        FuseSidebarModule,
        MatPaginatorModule,
        MatTooltipModule,
        CatalogModule,
        UserModule,
        TodoModule
    ],
    providers   : [
        TodoService, CatalogsService, CatalogService, UsersService, UserService, TodoService
    ]
})
export class AdminModule
{
}
