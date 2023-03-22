import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {EnviromentsService} from "../../../../../services/enviroments.service";
import {FuseUtils} from "../../../../../../@fuse/utils";
import {BaseService} from "../../../../../services/base-service.service";
import { retry, catchError } from 'rxjs/operators';

@Injectable()
export class UserService extends BaseService<any> implements Resolve<any>
{
    routeParams: any;
    user: any;
    onUserChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private enviroment: EnviromentsService
    )
    {
        super(_httpClient, enviroment.getEnviroment().apiUrl, 'users');
        // Set the defaults
        this.onUserChanged = new BehaviorSubject({});
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
                this.getUser(this.routeParams['id'])
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get user
     *
     * @returns {Promise<any>}
     */
    getUser(id): Promise<any>
    {
        return new Promise((resolve, reject) => {
            if ( this.routeParams.id === 'new' ) {
                this.onUserChanged.next(this.routeParams);
                resolve(false);
            } else {

                return this._httpClient.get(`${this.enviroment.getEnviroment().apiUrl}/users/`+id)
                    .subscribe((response: any) => {
                        this.user = response;
                        console.log(this.user)
                        this.onUserChanged.next(this.user);
                        resolve(response);
                    }, reject);
            }
        });
    }

    /**
     * Save user
     *
     * @param user
     * @returns {Promise<any>}
     */
    saveUser(params)
    {
        return this.update(params);
    }

    /**
     * Add user
     *
     * @param user
     * @returns {Promise<any>}
     */
    addUser(params)
    {
        return this.create(params);
    }
    updatePassword(item: any): Observable<any> {
        return this._httpClient.put<any>(`${this.enviroment.getEnviroment().apiUrl}/users/changePassword`, JSON.stringify(item), this.httpOptions)
            .pipe(
                // retry(2),

            )
    }
   
    updateImage(question): Observable<any> {
        let params = new FormData();
        params.append('avatar', new Blob([question.avatar],
            {
                type: "multipart/form-data"
            }), question.avatar.name);



        params.append('data', new Blob([JSON.stringify({
            "id": question.id,
            "userName": question.username,
            "username": question.username,
            "name": question.name,
            "lastName": question.lastName,
            "email": question.email,
            "roles": question.roles,
            "enabled": true
        })], {
            type: "application/json"
        }));


        const httpHeaders = new HttpHeaders({
            "enctype": "multipart/form-data",
        });

        const options = {
            headers: httpHeaders
        };
        return this._httpClient.put<any>(`${this.enviroment.getEnviroment().apiUrl}/users/updateImage`, params, options)
            .pipe(
            // retry(2),

        )
    }
    // updateImage(question): Promise<any> {       
    //     return new Promise((resolve, reject) => {
    //         //console.log(question.avatar);
    //         let params = new FormData();          
    //             params.append('avatar', new Blob([question.avatar],
    //                 {
    //                     type: "multipart/form-data"
    //                 }), question.avatar.name);
            
          

    //         params.append('data', new Blob([JSON.stringify({
    //             "id": question.id,
    //             "userName": question.username,
    //             "username": question.username,
    //             "name": question.name,
    //             "lastName": question.lastName,
    //             "email": question.email,
    //             "roles": question.roles,
    //             "enabled": true
    //         })], {
    //             type: "application/json"
    //         }));          


    //         const httpHeaders = new HttpHeaders({
    //             "enctype": "multipart/form-data",
    //         });

    //         const options = {
    //             headers: httpHeaders
    //         };


    //         this._httpClient.put(`${this.enviroment.getEnviroment().apiUrl}/users/updateImage`, params, options)
    //             .subscribe((response: any) => {
    //                 resolve(response);
                   
    //                 // console.log(params)
    //                 /// this.router.navigate(['/question', response.data.id]);
    //             }, reject);
    //     });
    // }
}
