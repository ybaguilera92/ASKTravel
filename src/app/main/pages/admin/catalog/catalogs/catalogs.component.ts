import {AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, startWith, tap} from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import { takeUntil } from 'rxjs/internal/operators';
import {CatalogsService} from "./catalogs.service";
import {FormControl} from "@angular/forms";
import {CatalogModel} from "../catalog/catalog.model";
import {FuseConfigService} from "../../../../../../@fuse/services/config.service";


@Component({
    selector     : 'catalogs',
    templateUrl  : './catalogs.component.html',
    styleUrls    : ['./catalogs.component.scss'],
    animations   : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class CatalogsComponent implements OnInit, AfterViewInit
{
    dataSource: FilesDataSource | null;
    displayedColumns = ['tablaArgumento', 'tablaDescription', 'tablaReferencia', 'status'];

    @ViewChild(MatPaginator, {static: true})
    paginator: MatPaginator;

    @ViewChild(MatSort, {static: true})
    sort: MatSort;

    @ViewChild('filter', {static: true})
    filter: ElementRef;

    // Private
    private _unsubscribeAll: Subject<any>;

    options: CatalogModel[] =  [];
    showTable = false;

    constructor(private _fuseConfigService: FuseConfigService,
        private catalogsService: CatalogsService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: false
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
    selected: any;

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.catalogsService.onProductsChanged.subscribe(options => {
                this.options = options;
                if (this.options.length) {
                    this.selected = this.options[0].idTabla;
                }
        })

        this.catalogsService.onCatalogsChanged.subscribe(options => {
            if(options['totalItems']){
                this.dataSource = new FilesDataSource(this.catalogsService, this.paginator, this.sort);
                this.showTable = true;
            }
        });

    }

    ngAfterViewInit() {
        this.paginator.page
            .pipe(
                tap(() => this.loadCatalogsPage())
            )
            .subscribe();
    }

    loadCatalogsPage() {
        this.getCatalog(
            this.selected,
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    getCatalog(value: any,  pageNo = 0, pageSize = 5) {
        this.selected = value;
        this.catalogsService.getCatalogsByIdTabla(value, pageNo, pageSize);
    }
}

export class FilesDataSource extends DataSource<any>
{
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');
    private _length = 100;
    pageSize = 10;
    pageIndex = 10;
    pageSizeOptions: number[] = []

    /**
     * Constructor
     *
     * @param {EcommerceProductsService} catalogsService
     * @param {MatPaginator} _matPaginator
     * @param {MatSort} _matSort
     */
    constructor(
        private catalogsService: CatalogsService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    )
    {
        super();

        this.filteredData = this.catalogsService.catalogs['catalogs'];
        this._length = this.catalogsService.catalogs['totalItems'];
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {
        const displayDataChanges = [
            this.catalogsService.onCatalogsChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                        let data = this.catalogsService.catalogs['catalogs'].slice();
                        data = this.filterData(data);
                        this.filteredData = [...data];
                        data = this.sortData(data);

                        return data;
                    }
                ));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Filtered data
    get filteredData(): any
    {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any)
    {
        this._filteredDataChange.next(value);
    }

    // Filter
    get filter(): string
    {
        return this._filterChange.value;
    }

    get length(): number{
        return this._length;
    }

    set filter(filter: string)
    {
        this._filterChange.next(filter);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter data
     *
     * @param data
     * @returns {any}
     */
    filterData(data): any
    {
        if ( !this.filter )
        {
            return data;
        }
        return FuseUtils.filterArrayByString(data, this.filter);
    }

    /**
     * Sort data
     *
     * @param data
     * @returns {any[]}
     */
    sortData(data): any[]
    {
        if ( !this._matSort.active || this._matSort.direction === '' )
        {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch ( this._matSort.active )
            {
                case 'tabla':
                    [propertyA, propertyB] = [a.tabla, b.tabla];
                    break;
                case 'argumento':
                    [propertyA, propertyB] = [a.argumento, b.argumento];
                    break;
                case 'descripcion':
                    [propertyA, propertyB] = [a.descripcion, b.descripcion];
                    break;
                case 'referencia':
                    [propertyA, propertyB] = [a.referencia, b.referencia];
                    break;
                case 'estado':
                    [propertyA, propertyB] = [a.estado, b.estado];
                    break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
        });
    }

    /**
     * Disconnect
     */
    disconnect(): void
    {
    }
}
