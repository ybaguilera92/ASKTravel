import { NgModule } from '@angular/core';
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
import {RouterModule} from "@angular/router";
import {TodoComponent} from "./todo.component";
import {TodoMainSidebarComponent} from "./sidebars/main/main-sidebar.component";
import {TodoListItemComponent} from "./todo-list/todo-list-item/todo-list-item.component";
import {TodoListComponent} from "./todo-list/todo-list.component";
import {TodoDetailsComponent} from "./todo-details/todo-details.component";
import {TodoService} from "./todo.service";
import {EditorModule} from "@tinymce/tinymce-angular";


/*const routes: Routes = [
    {
        path     : 'all',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        },
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin, Role.Moderator]}
    },
    {
        path     : 'all/:todoId',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        },
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin, Role.Moderator]}
    },
    {
        path     : 'tag/:tagHandle',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        },
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin, Role.Moderator]}
    },
    {
        path     : 'tag/:tagHandle/:todoId',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        },
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin, Role.Moderator]}
    },
    {
        path     : 'filter/:filterHandle',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        },
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin, Role.Moderator]}
    },
    {
        path     : 'filter/:filterHandle/:todoId',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        },
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin, Role.Moderator]}
    }
];*/

@NgModule({
    declarations: [
        TodoComponent,
        TodoMainSidebarComponent,
        TodoListItemComponent,
        TodoListComponent,
        TodoDetailsComponent
    ],
    imports: [
        //RouterModule.forChild(routes),

        RouterModule,
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
        EditorModule
    ],
    providers   : [
        TodoService
    ]
})
export class TodoModule
{
}
