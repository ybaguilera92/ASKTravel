import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Location} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {fuseAnimations} from '@fuse/animations';
import {FuseUtils} from '@fuse/utils';


import {CatalogModel} from "./catalog.model";
import {CatalogService} from "./catalog.service";
import {Router} from "@angular/router";
import {FuseConfigService} from "../../../../../../@fuse/services/config.service";
import {isNullOrEmpty} from "../../../../../fuse-config";

@Component({
    selector: 'catalog',
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class CatalogComponent implements OnInit, OnDestroy {
    product: CatalogModel;
    pageType: string;
    productForm: FormGroup;
    options = [
        {id: 'A', desc: 'Activo'},
        {id: 'I', desc: 'Inactivo'}
    ];

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {CatalogService} catalogService
     * @param {FormBuilder} _formBuilder
     * @param {Location} _location
     * @param {MatSnackBar} _matSnackBar
     */
    constructor(private _fuseConfigService: FuseConfigService,
                private catalogService: CatalogService,
                private _formBuilder: FormBuilder,
                private _location: Location,
                private _matSnackBar: MatSnackBar,
                private _router: Router
    ) {
        // Set the default
        this.product = new CatalogModel();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: false
                },
                toolbar: {
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
    ngOnInit(): void {
        // Subscribe to update catalog on changes
        this.catalogService.onProductChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(catalog => {
                if (catalog.id != 'new') {
                    this.product = new CatalogModel(catalog);
                    this.pageType = 'edit';
                } else {
                    this.pageType = 'new';
                    this.product = new CatalogModel();
                    this.product.idTabla = catalog.handle;
                }
                this.productForm = this.createForm();
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create catalog form
     *
     * @returns {FormGroup}
     */
    createForm(): FormGroup {
        return this._formBuilder.group({
            id: [!isNullOrEmpty(this.product.id) ? this.product.id : null],
            idTabla: [this.product.idTabla],
            tablaArgumento: [this.product.tablaArgumento],
            tablaReferencia: [this.product.tablaReferencia],
            tablaDescription: [this.product.tablaDescription],
            status: [this.product.status],
        });
    }

    /**
     * Save catalog
     */
    saveCatalog(): void {
        const data = this.productForm.getRawValue();
        this.catalogService.create(data).subscribe( response => {
            this.catalogService.onProductChanged.next(response);
            this._router.navigate(['/admin/catalogs']);
        })
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
