import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';

import {CatalogComponent} from "./catalog/catalog.component";
import {CatalogService} from "./catalog/catalog.service";
import {CatalogsComponent} from "./catalogs/catalogs.component";
import {CatalogsService} from "./catalogs/catalogs.service";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {AuthGuard} from "../../../../helpers/auth.guard";
import {Role} from "../../../../models/user";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";



/*const routes: Routes = [
    {
        path     : 'catalogs',
        component: CatalogsComponent,
        resolve  : {
            data: CatalogsService
        },
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin, Role.Moderator]}
    },
    {
        path     : 'catalogs/:id',
        component: CatalogComponent,
        resolve  : {
            data: CatalogService
        },
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin, Role.Moderator]}
    },
    {
        path     : 'catalogs/:id/:handle',
        component: CatalogComponent,
        resolve  : {
            data: CatalogService
        },
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin, Role.Moderator]}
    },
];*/

@NgModule({
    declarations: [
        CatalogsComponent,
        CatalogComponent,
    ],
    imports: [
        //RouterModule.forChild(routes),

        MatButtonModule,
        MatChipsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatSnackBarModule,
        MatTableModule,
        MatTabsModule,
        RouterModule,
        NgxChartsModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyD81ecsCj4yYpcXSLFcYU97PvRsE_X8Bx8'
        }),

        FuseSharedModule,
        FuseWidgetModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
    ],
    providers   : [
        CatalogsService,
        CatalogService,
    ]
})
export class CatalogModule
{
}
