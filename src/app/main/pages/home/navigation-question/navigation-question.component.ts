import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {FuseConfigService} from "../../../../../@fuse/services/config.service";
import {HomeService} from "../home.service";
import {Router} from "@angular/router";
import {AuthenticationService} from "../../../../services/authentication.service";
import {FuseDialogService} from "../../../../../@fuse/services/dialog.service";
import {TokenStorageService} from "../../../../services/token.service";
import {User} from "../../../../models/user";
import {CommonService} from "../../../../services/common.service";
import {isNullOrEmpty} from "../../../../fuse-config";
import {takeUntil} from "rxjs/operators";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'navigation-question',
    templateUrl: './navigation-question.component.html',
    styleUrls: ['./navigation-question.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class NavigationQuestionComponent implements OnInit, OnDestroy {
    currentUser: User;

    // Private
    private _unsubscribeAll: Subject<any>;
    data$: Observable<any>;
    type: string;
    pageIndex = 0;
    pageSize = 5;
    totalPages = 0;
    questions = [];
    end = false;
    status = '';

    readonly NAVIGATION = this.homeService.NAVIGATION;

    /**
     * Constructor
     *
     * @param _fuseConfigService
     * @param {HomeService} _faqService
     * @param commonService
     * @param router
     * @param _authenticationService
     * @param fuseDialogService
     * @param tokenStorage
     * @param _matSnackBar
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _faqService: HomeService,
        private commonService: CommonService,
        private homeService: HomeService,
        private router: Router,
        private _authenticationService: AuthenticationService,
        public fuseDialogService: FuseDialogService,
        private tokenStorage: TokenStorageService,
        private _matSnackBar: MatSnackBar
    ) {

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: false
                },
                sidepanel: {
                    hidden: false
                }
            }
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    loading = false;

    /**
     * On init
     */
    ngOnInit(): void {
        this.data$ = this.homeService.data$;
        this.type = this.NAVIGATION.RECENT_QUESTIONS;
        this.status = this.NAVIGATION.RECENT_QUESTIONS;
        this.homeService.searchQuestionObservable
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(  action => {
                if(!isNullOrEmpty(action)){
                    this.homeService.goTo(action);
                }
            });
    }

    onScroll() {
        this.homeService.goTo(this.type);
    }

    goTo(type) {
        this.type = type;
        this.homeService.goTo(this.type);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


}