import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';

import { FaqService } from 'app/main/pages/faq/faq.service';
import {FuseConfigService} from "../../../../@fuse/services/config.service";
import {Router} from "@angular/router";
import {DialogOption, FuseDialogService} from "../../../../@fuse/services/dialog.service";
import {AuthenticationService} from "../../../services/authentication.service";
import {User} from "../../../models/user";

@Component({
    selector     : 'faq',
    templateUrl  : './faq.component.html',
    styleUrls    : ['./faq.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FaqComponent implements OnInit, OnDestroy
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
     * @param {FaqService} _faqService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _faqService: FaqService,
        private router: Router,
        private _authenticationService: AuthenticationService,
        public _dialog: FuseDialogService
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
                    hidden: true
                },
                sidepanel: {
                    hidden: true
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

        this._authenticationService.currentUser.subscribe((user) => {
            this.currentUser = user;
        });
    }

    clear(){
        this.searchControl.setValue(null);
    }

    findAnswers(event){
        console.log(event);
        this.router.navigate(['search'], { queryParams: { questionId: event.option.id } });
    }

    goTo(route: string): void{
        if(this.currentUser){
            switch (route) {
                case "/ask":
                    this.router.navigate([route]);
                    break;
                default:
                    this.router.navigate([route]);

            }
        }
        else {
            let options: DialogOption = {
                title :'Estimado usuario',
                message : 'Debes iniciar sesión para ver esta página',
                buttonText : {
                    ok: {
                        title: 'Iniciar sesión',
                    }
                }
            }

            this._dialog.openDialog(options);
            this._dialog.confirmed().subscribe(confirmed => {
                if (confirmed) {
                    this.router.navigate(['auth/login']);
                }
            });
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
