import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { concat, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { navigation } from 'app/navigation/navigation';
import { AuthenticationService } from "../../../services/authentication.service";
import { User } from "../../../models/user";
import { ActivatedRoute, Router } from "@angular/router";

import { DialogOption, FuseDialogService } from "../../../../@fuse/services/dialog.service";
import { isNullOrEmpty } from "../../../fuse-config";
import { MatDialogConfig } from "@angular/material/dialog";
import { FuseQuestionDialogComponent } from "../../../../@fuse/components/question-dialog/question-dialog.component";
import { Login2Component } from "../../../main/pages/authentication/login-2/login-2.component";
import { Register2Component } from "../../../main/pages/authentication/register-2/register-2.component";
import { TokenStorageService } from "../../../services/token.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Todo } from "../../../main/pages/admin/todo/todo.model";
import { CommonService } from "../../../services/common.service";
import { HomeService } from "../../../main/pages/home/home.service";
import { DomSanitizer } from '@angular/platform-browser';


@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy {
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    hiddenQuestion: boolean = false;
    languages: any;
    navigation: any;
    selectedLanguage: any;
    userStatusOptions: any[];
    currentUser: User;
    searchForm: FormGroup;
    searchControl: any;
    question: any;
    questions: Observable<{ type: string; data?: any[] }>;
    profile$: Observable<any>;
    loading = false;
    // image ='./assets/images/user2.png';
    image: any;
    imagenExiste = false;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     * @param {AuthenticationService} _authenticationService
     * @param {Router} _router
     * @param {tokenStorage} tokenStorage
     * @param {FuseDialogService} fuseDialogService
     * @param {FormBuilder} _formBuilder
     * @param {CommonService} _commonService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private _authenticationService: AuthenticationService,
        public _router: Router,
        private tokenStorage: TokenStorageService,
        private fuseDialogService: FuseDialogService,
        private _formBuilder: FormBuilder,
        private _commonService: CommonService,
        private _activatedRoute: ActivatedRoute,
        private _domSanitizer: DomSanitizer
    ) {
        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon: 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon: 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon: 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.languages = [
            {
                id: 'en',
                title: 'English',
                flag: 'us'
            },
            {
                id: 'tr',
                title: 'Turkish',
                flag: 'tr'
            }
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.question = '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.profile$ = this._commonService.profileHeaderInfo;
        //  console.log(this._router.url);
        this.searchForm = this.createForm();
        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        this._authenticationService.currentUser.subscribe((user) => {
            this.currentUser = !isNullOrEmpty(user) ? user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.tokenStorage.getUser() : null;
            //  console.log(this.currentUser);          
            if (this.currentUser != null) {
                this.imagenExiste = false;
                //   console.log(this.currentUser.fileEncode);
                if (!isNullOrEmpty(this.currentUser.fileEncode)) {
                    this.image = this._domSanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,'
                        + this.currentUser.fileEncode);       //     console.log('hola');
                    this.imagenExiste = true;
                }
            }


        });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, { id: this._translateService.currentLang });

        this.questions = this.searchForm.get('search').valueChanges
            .pipe(
                debounceTime(250),
                distinctUntilChanged(),
                switchMap((query) => {
                    if (!isNullOrEmpty(query)) {
                        return concat(
                            of({ type: 'start' }),
                            this._commonService.search({ phrase: query }).pipe(
                                map(data => ({ type: 'finish', data })))
                        )
                    } else
                        return new Observable<{ type: string; data?: any[] }>();
                }
                ));
    }
    inicio() {
        console.log('hola');
        this._router.navigate(['/home']);
    }
    /**
     * Create form
     *
     * @returns {FormGroup}
     */
    createForm()
        :
        FormGroup {
        return this._formBuilder.group({
            search: [''],
        });
    }
    gotoContent() {
        this._router.navigate(['/about']);        
        return true;
     }
    showMenuTrigger() {
        // user-click-open
        document.getElementsByClassName('user-login-click float_r')[0].classList.add('user-click-open');
        this.showMenu = true
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    showMenu = false;


    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key)
        :
        void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang)
        :
        void {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }

    /**
     * Redirect to route
     *
     * @param lang
     */
    goTo(route: string) {
        if (this.currentUser) {
            switch (route) {
                case "/ask":
                    this.hiddenQuestion = true;
                    this._router.navigate([route]);
                    break;
                case "/profile":
                    this._router.navigate([route, this.currentUser.id])
                default:
                    this.hiddenQuestion = false;
                    this._router.navigate([route]);

            }
        } else {
            let options: DialogOption = {
                title: 'Estimado usuario',
                message: 'Debes iniciar sesión para ver esta página',
                buttonText: {
                    ok: {
                        title: 'Iniciar sesión',
                    }
                }
            }

            this.fuseDialogService.openDialog(options);
            this.fuseDialogService.confirmed().subscribe(confirmed => {
                if (confirmed) {
                    this._router.navigate(['auth/login']);
                }
            });
        }
        return false;
    }

    logout()
        :
        void {
        this._authenticationService.logout();
    }

    goToSign(type) {
        let options: MatDialogConfig = {
            width: '850px'
        }
        switch (type) {
            case 'in':
                this.fuseDialogService.buildDialogStyle(Login2Component, options);
                break;
            case 'up':
                this.fuseDialogService.buildDialogStyle(Register2Component, options);
                break;
            default:
                break;
        }
    }

    makeQuestion() {
        if (this.currentUser) {
            this.fuseDialogService.buildDialog(FuseQuestionDialogComponent, {
                panelClass: 'custom-dialog-container'
            });
        } else {
            this.fuseDialogService.buildDialogStyle(Login2Component, {
                width: '850px'
            });
        }
    }

    findAnswers(event) {
        //this._searchClassicService.getSearchData(event.option.value);
    }

    findAnswersOnEnter(event) {
        // this._searchClassicService.getSearchData(this.searchControl.value);
    }

    clear() {
        this.searchForm.reset();
        this.question = '';
    }

    /**
     * On destroy
     */
    ngOnDestroy()
        :
        void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    checkData(data) {
        return !isNullOrEmpty(data) && !isNullOrEmpty(data.questions) && data.questions.length > 0;
    }
}
