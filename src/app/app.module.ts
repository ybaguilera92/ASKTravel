import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ExtraOptions, RouterModule, Routes} from '@angular/router';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslateModule} from '@ngx-translate/core';
import 'hammerjs';

import {FuseModule} from '@fuse/fuse.module';
import {FuseSharedModule} from '@fuse/shared.module';
import {FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule, IconSnackBarModule} from '@fuse/components';

import {fuseConfig} from 'app/fuse-config';

import {AppComponent} from 'app/app.component';
import {LayoutModule} from 'app/layout/layout.module';
import {SampleModule} from 'app/main/sample/sample.module';
import {EnviromentsService} from "./services/enviroments.service";
import {EncryptionService} from "./services/encryption.service";
import {AuthInterceptor} from "./helpers/auth.interceptor";
import {AuthGuard} from "./helpers/auth.guard";
import localeEs from "@angular/common/locales/es";
import {HashLocationStrategy, LocationStrategy, registerLocaleData} from "@angular/common";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {IconSnackBarComponent} from "../@fuse/components/icon-snack-bar/icon-snack-bar.component";
import { ContentComponent } from './layout/components/content/content.component';

registerLocaleData(localeEs, "es");

const appRoutes: Routes = [
    {path: '', loadChildren: './main/pages/pages.module#PagesModule'},
    {
        path: '**', redirectTo: '/', pathMatch: 'full'
    },
    {
        path: 'content',component:ContentComponent
    },
   
];

const extraOptions: ExtraOptions = {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 64], // cool option, or ideal option when you have a fixed header on top.
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes,extraOptions),

        TranslateModule.forRoot(),

        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,
        MatSnackBarModule,
        IconSnackBarModule,

        // App modules
        LayoutModule,
        SampleModule
    ],
    providers: [
        EnviromentsService,
        EncryptionService,
        AuthGuard,
        {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
        { provide: LOCALE_ID, useValue: "es" },
       // { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    entryComponents: [
        IconSnackBarComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
