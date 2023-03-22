import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import {HttpClient, HttpParams} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {EnviromentsService} from "../../../../../services/enviroments.service";
import {FuseSplashScreenService} from "../../../../../../@fuse/services/splash-screen.service";
import {BaseService} from "../../../../../services/base-service.service";
import {Catalog} from "../../../../../models/catalog";
import Swal from "sweetalert2";


@Injectable()
export class CatalogsService extends BaseService<Catalog> implements Resolve<any>
{
    products: any[];
    catalogs: any[];
    onCatalogsChanged: BehaviorSubject<any>;
    onProductsChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private environment: EnviromentsService,
        private _fuseSplashScreenService: FuseSplashScreenService
    )
    {
        super(_httpClient, environment.getEnviroment().apiUrl, 'catalogs');
        // Set the defaults
        this.onProductsChanged = new BehaviorSubject({});
        this.onCatalogsChanged = new BehaviorSubject({});
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
        return new Promise((resolve, reject) => {

            Promise.all([
                this.get(new HttpParams().set('type', 'all')).subscribe(response => {
                    this.products = response;
                    this.onProductsChanged.next(this.products['catalogs']);
                    if(this.products['catalogs'].length){
                        this.getCatalogsByIdTabla(this.products['catalogs'][0].idTabla);
                    }
                })
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get catalogs by idTabla
     *
     * @returns {Promise<any>}
     **/

    getCatalogsByIdTabla(idTabla: string, pageNo = 0, pageSize = 5): Promise<any>
    {
        this._fuseSplashScreenService.show();
        let params = new HttpParams()
                .set('arg', idTabla)
                .set('pageNo', pageNo.toString())
                .set('pageSize', pageSize.toString())
                .set('type', 'byidtabla');

        return new Promise((resolve, reject) => {
            return this.get(params)
                .subscribe((response: any) => {
                    this.catalogs = response;
                    this.onCatalogsChanged.next(this.catalogs);
                    this._fuseSplashScreenService.hide();
                    resolve(response);
                }, error => {
                    this.showError(error);
                });
        });
    }

    private showError(error){
        let message = '';
        switch (error.type){
            default:
                message = 'Ha ocurrido un error inesperado. Verifíque su conexión o contácte a nuestro servicio de asistencia técnica';
                break
        }
        this._fuseSplashScreenService.hide();
        Swal.fire({
            title: 'Estimado Usuario',
            text: message,
            icon: 'error'
        });
    }
}
