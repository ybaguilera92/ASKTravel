import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import {HttpClient, HttpParams} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {EnviromentsService} from "../../../../../services/enviroments.service";
import {FuseSplashScreenService} from "../../../../../../@fuse/services/splash-screen.service";
import {isNullOrEmpty} from "../../../../../fuse-config";
import {User} from "../../../../../models/user";


@Injectable()
export class UsersService implements Resolve<any>
{
    users: any[];
    onUsersChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private environment: EnviromentsService,
        private fuseSplashScreenService: FuseSplashScreenService
    )
    {
        // Set the defaults
        this.onUsersChanged = new BehaviorSubject({});
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
                this.getUsers({})
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get users
     *
     * @returns {Promise<any>}
     */
    getUsers(handle): Promise<User[]>
    {
        let params= {};

        if(!isNullOrEmpty(handle)){
            params = new HttpParams({
                fromObject: {
                    page: handle!.pageIndex.toString(),
                    size: handle!.pageSize.toString(),
                }
            });
        }

        this.fuseSplashScreenService.show();
        return new Promise((resolve, reject) => {
            return this._httpClient.get(`${this.environment.getEnviroment().apiUrl}/users`, {params})
                .subscribe((response: any) => {
                    this.users = response.users;
                    this.onUsersChanged.next(response);
                    resolve(response);
                    this.fuseSplashScreenService.hide();
                }, reject);
        });
    }
}
