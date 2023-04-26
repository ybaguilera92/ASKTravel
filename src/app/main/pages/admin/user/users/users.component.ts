import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import {map, tap} from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import {UsersService} from "./users.service";
import {FuseConfigService} from "../../../../../../@fuse/services/config.service";
import {User} from "../../../../../models/user";


@Component({
    selector     : 'users',
    templateUrl  : './users.component.html',
    styleUrls    : ['./users.component.scss'],
    animations   : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit,  OnDestroy {
    ocultarb = true;
    dataSource: FilesDataSource | null;
    displayedColumns = ['username', 'name', 'lastName', 'email', 'enabled'];

    @ViewChild(MatPaginator, {static: true})
    paginator: MatPaginator;

    @ViewChild(MatSort, {static: true})
    sort: MatSort;

    @ViewChild('filter', {static: true})
    filter: ElementRef;

    // Private
    private _unsubscribeAll: Subject<any>;

    options: User[] =  [];
    showTable = false;
    pageEvent: PageEvent;
    pageSizeOptions: number[] = [];

    constructor(private _fuseConfigService: FuseConfigService,
        private usersService: UsersService
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

    /**
     * On init
     */
    
    ngOnInit(): void
    {
        if (sessionStorage.getItem('inicio') == 'inicio') {           
            window.location.reload();
            sessionStorage.removeItem('inicio');
        }
       
        this.usersService.onUsersChanged.subscribe(options => {
            if(options.users.length){
                this.paginator.length = options.page.totalElements;
                this.paginator.pageIndex = options.page.number;
                this.paginator.pageSize = options.page.size;
                this.dataSource = new FilesDataSource(this.usersService, this.paginator, this.sort);
                this.showTable = true;
            }
        });

        this.paginator.page
            .pipe(
                tap(() => this.getServerData())
            )
            .subscribe();
    }
    ngOnDestroy(): void {
        sessionStorage.removeItem('users');
    }
    getServerData() {
        this.showTable = false;
        this.usersService.getUsers(this.paginator);
        this.scrollbarTop();
    }

    scrollbarTop(){
        window.scroll(0,0);
    }
    ocultar() {
        this.ocultarb = false;
    }
}

export class FilesDataSource extends DataSource<any>
{
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    /**
     * Constructor
     *
     * @param {EcommerceProductsService} usersService
     * @param {MatPaginator} _matPaginator
     * @param {MatSort} _matSort
     */
    constructor(
        private usersService: UsersService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    )
    {
        super();
        this.filteredData = this.usersService.users;
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {
        const displayDataChanges = [
            this.usersService.onUsersChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                        let data = this.usersService.users.slice();

                        data = this.filterData(data);

                        this.filteredData = [...data];

                        data = this.sortData(data);

                        return data;

                        // Grab the page's slice of data.
                       /* const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
                        return data.splice(startIndex, this._matPaginator.pageSize);*/
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
