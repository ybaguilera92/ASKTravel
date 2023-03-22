import {Component, HostListener, Inject, OnDestroy, OnInit} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';
import {TranslateService} from '@ngx-translate/core';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {FuseConfigService} from '@fuse/services/config.service';
import {FuseNavigationService} from '@fuse/components/navigation/navigation.service';
import {FuseSidebarService} from '@fuse/components/sidebar/sidebar.service';
import {FuseSplashScreenService} from '@fuse/services/splash-screen.service';
import {FuseTranslationLoaderService} from '@fuse/services/translation-loader.service';

import {navigation} from 'app/navigation/navigation';
import {locale as navigationEnglish} from 'app/navigation/i18n/en';
import {locale as navigationTurkish} from 'app/navigation/i18n/tr';
import {EnviromentsService} from "./services/enviroments.service";
import {environment} from "../environments/environment";
import {EncryptionService} from "./services/encryption.service";
import {AuthenticationService} from "./services/authentication.service";
import {EventBusService} from "./helpers/event-bus.service";
import {CommonService} from "./services/common.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {IconSnackBarComponent} from "../@fuse/components/icon-snack-bar/icon-snack-bar.component";

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    fuseConfig: any;
    navigation: any;
    online = true;

    // Private
    private _unsubscribeAll: Subject<any>;
    eventBusSub?: Subscription;

    /**
     * Constructor
     *
     * @param {DOCUMENT} document
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {FuseSplashScreenService} _fuseSplashScreenService
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     * @param {Platform} _platform
     * @param {TranslateService} _translateService
     * @param _enviroments
     * @param _encryptionService
     * @param _authenticationService
     * @param eventBusService
     * @param commonService
     */
    constructor(
        @Inject(DOCUMENT) private document: any,
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _translateService: TranslateService,
        private _platform: Platform,
        private _enviroments: EnviromentsService,
        private _encryptionService: EncryptionService,
        private _authenticationService: AuthenticationService,
        private eventBusService: EventBusService,
        private commonService: CommonService,
        private _matSnackBar: MatSnackBar
    ) {
        // Get default navigation
        this.navigation = navigation;

        // Register the navigation to the service
        this._fuseNavigationService.register('main', this.navigation);

        // Set the main navigation as our current navigation
        this._fuseNavigationService.setCurrentNavigation('main');

        // Add languages
        this._translateService.addLangs(['en', 'tr']);

        // Set the default language
        this._translateService.setDefaultLang('en');

        // Set the navigation translations
        this._fuseTranslationLoaderService.loadTranslations(navigationEnglish, navigationTurkish);

        // Use a language
        this._translateService.use('en');

        // Set Enviroment
        this._enviroments.initEnvironment(environment);
        this._encryptionService.initServiceEnvironment(environment);

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix Start
         * ----------------------------------------------------------------------------------------------------
         */

        /**
         * If you are using a language other than the default one, i.e. Turkish in this case,
         * you may encounter an issue where some of the components are not actually being
         * translated when your app first initialized.
         *
         * This is related to ngxTranslate module and below there is a temporary fix while we
         * are moving the multi language implementation over to the Angular's core language
         * service.
         **/

        // Set the default language to 'en' and then back to 'tr'.
        // '.use' cannot be used here as ngxTranslate won't switch to a language that's already
        // been selected and there is no way to force it, so we overcome the issue by switching
        // the default language back and forth.
        /**
         setTimeout(() => {
            this._translateService.setDefaultLang('en');
            this._translateService.setDefaultLang('tr');
         });
         */

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix End
         * ----------------------------------------------------------------------------------------------------
         */

        // Add is-mobile class to the body if the platform is mobile
        if (this._platform.ANDROID || this._platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {

                this.fuseConfig = config;

                // Boxed
                if (this.fuseConfig.layout.width === 'boxed') {
                    this.document.body.classList.add('boxed');
                } else {
                    this.document.body.classList.remove('boxed');
                }

                // Color theme - Use normal for loop for IE11 compatibility
                for (let i = 0; i < this.document.body.classList.length; i++) {
                    const className = this.document.body.classList[i];

                    if (className.startsWith('theme-')) {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.fuseConfig.colorTheme);
            });

        this.eventBusSub = this.eventBusService.on('logout', () => {
            this.logout();
        });

        this.commonService.checkInternetConnection().pipe(
            takeUntil(this._unsubscribeAll)).subscribe((online) => {
            if (!online) {
                this.online = online;
                this._matSnackBar.openFromComponent(IconSnackBarComponent, {
                    duration: 3000,
                    verticalPosition: 'top',
                    data: {
                        message: "En este momento no tienes conexión...",
                        icon: 'wifi_off'
                    }
                });
            } else if (online && !this.online) {
                this._matSnackBar.openFromComponent(IconSnackBarComponent, {                   
                    verticalPosition: 'top',
                    duration: 3000,
                        data: {
                            online: true,
                            message: "Se ha restablecido la conexión a internet...",
                            icon: 'wifi'
                        }
                });
            }
        });
    }

    logout(): void {
        this._authenticationService.logout();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        if (this.eventBusSub)
            this.eventBusSub.unsubscribe();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }
}
