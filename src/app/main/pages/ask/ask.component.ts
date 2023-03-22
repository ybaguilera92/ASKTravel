import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged, first, takeUntil} from 'rxjs/operators';

import { FuseUtils } from '@fuse/utils';

import { HomeService } from 'app/main/pages/home/home.service';
import {FuseConfigService} from "../../../../@fuse/services/config.service";
import {Router} from "@angular/router";
import {AskService} from "./ask.service";
import {TokenStorageService} from "../../../services/token.service";
import {FuseDialogService} from "../../../../@fuse/services/dialog.service";
import {isNotNullOrUndefined} from "codelyzer/util/isNotNullOrUndefined";

@Component({
    selector     : 'ask',
    templateUrl  : './ask.component.html',
    styleUrls    : ['./ask.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AskComponent implements OnInit, OnDestroy
{
    faqs: any;
    faqsFiltered: any;
    step: number;
    searchInput: any;
    form: FormGroup;
    options: any;

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
        private _formBuilder: FormBuilder,
        private _router: Router,
        private askService: AskService,
        private tokenStorage: TokenStorageService,
        private _dialog: FuseDialogService
    )
    {
        // Set the defaults
        this.searchInput = new FormControl('');
        this.step = 0;

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
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
        this.form = this._formBuilder.group({
            question   : ['', Validators.required]
        });

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set step
     *
     * @param {number} index
     */
    setStep(index: number): void
    {
        this.step = index;
    }

    /**
     * Next step
     */
    nextStep(): void
    {
        this.step++;
    }

    /**
     * Previous step
     */
    prevStep(): void
    {
        this.step--;
    }

    goBack(){
        this._router.navigate([""]);
    }

    onSubmit(){

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.askService.saveQuestion(this.form.controls.question.value)
            .pipe(first())
            .subscribe(
                data => {
                    if((data.data.id)){
                        this._dialog.openDialog({
                            title :'Estimado usuario',
                            message : 'Pregunta registrada satisfactoriamente. Recibirás la respuesta a través del correo electrónico registrado.',
                            buttonText : {
                                ok: {
                                    title: 'Aceptar',
                                }
                            }
                        });
                        this._dialog.confirmed().subscribe(confirmed => {
                            if (confirmed) {
                                this._router.navigate(['/']);
                            }
                        });
                    }
                },
                error => {
                    this._dialog.openDialog({
                        title :'Estimado usuario',
                        message : 'Ocurrieron errores, por favor reintenta.',
                        buttonText : {
                            ok: {
                                title: 'Aceptar',
                            }
                        }
                    });
                    this._dialog.confirmed().subscribe(confirmed => {
                        if (confirmed) {
                            this._router.navigate(['/']);
                        }
                    });
                });
    }
}
