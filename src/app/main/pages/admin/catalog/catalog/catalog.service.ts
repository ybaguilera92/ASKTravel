import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {EnviromentsService} from "../../../../../services/enviroments.service";
import {BaseService} from "../../../../../services/base-service.service";
import {Catalog} from "../../../../../models/catalog";


@Injectable()
export class CatalogService extends BaseService<Catalog> implements Resolve<any>
{
    routeParams: any;
    product: any;
    onProductChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private environment: EnviromentsService
    )
    {
        super(_httpClient, environment.getEnviroment().apiUrl, 'catalogs');
        // Set the defaults
        this.onProductChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getProduct(this.routeParams['id'])
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get catalog
     *
     * @returns {Promise<any>}
     */
    getProduct(id): Promise<any>
    {
        return new Promise((resolve, reject) => {
            if ( this.routeParams.id === 'new' )
            {
                this.onProductChanged.next(this.routeParams);
                resolve(false);
            }
            else
            {
                return this.getById(id)
                    .subscribe((response: any) => {
                        this.product = response;
                        this.onProductChanged.next(this.product);
                        resolve(response);
                    }, reject);
            }
        });
    }

   /* /!**
     * Add catalog
     *
     * @param product
     * @returns {Promise<any>}
     *!/
    addCatalog(params): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${this..getEnviroment().apiUrl}/catalog/create`, {

                "idTabla": params.idTabla,
                "tablaArgumento": params.tablaArgumento,
                "tablaDescription": params.tablaDescription,
                "tablaReferencia": params.tablaReferencia,
                "status": params.status
            })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }*/
}
