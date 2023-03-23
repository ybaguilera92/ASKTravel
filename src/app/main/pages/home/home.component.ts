import {Component, OnInit, OnDestroy, ViewEncapsulation, HostListener} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';

import { HomeService } from 'app/main/pages/home/home.service';
import {FuseConfigService} from "../../../../@fuse/services/config.service";
import {Router} from "@angular/router";
import {DIALOG_TYPES, DialogOption, FuseDialogService} from "../../../../@fuse/services/dialog.service";
import {AuthenticationService} from "../../../services/authentication.service";
import {User} from "../../../models/user";
import {isNullOrEmpty} from "../../../fuse-config";
import {TokenStorageService} from "../../../services/token.service";

@Component({
    selector     : 'home',
    templateUrl  : './home.component.html',
    styleUrls    : ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy
{
    faqs: any;
    faqsFiltered: any;
    step: number;
    searchControl: any;
    question: any;
    questions: any;
    currentUser: User;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {HomeService} _faqService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _faqService: HomeService,
        private router: Router,
        private _authenticationService: AuthenticationService,
        public fuseDialogService: FuseDialogService,
        private tokenStorage: TokenStorageService
    )
    {
        // Set the defaults
        this.searchControl = new FormControl('');
        this.step = 0;

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
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

    /**
     * On init
     */
    ngOnInit(): void
    {
       
        
               this._faqService.onFaqsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(response => {
                this.faqs = response;
                this.faqsFiltered = response;
            });

        this.questions = this.searchControl.valueChanges
            .pipe(
                debounceTime(250),
                distinctUntilChanged(),
                switchMap(value => this._faqService.search({question: value}, 1)));

        this._authenticationService.currentUser
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
            this.currentUser = !isNullOrEmpty(user) ? user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.tokenStorage.getUser() : null;
        });
    }

    clear(){
        this.searchControl.setValue(null);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        sessionStorage.removeItem('home');
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
