import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {EnviromentsService} from "../../../../services/enviroments.service";
import { BaseService } from 'app/services/base-service.service';


@Injectable()
export class ProfileService extends BaseService<any> implements Resolve<any>
{
    routeParams: any;
    user: any;
    onUserChanged: BehaviorSubject<any>;
    readonly USERTABS = [

            {
                ARG: 'ABOUT',
                DESC: 'Actividad',
            },

            {
                ARG: 'PROFILE_QUESTION',
                DESC: 'Preguntas',
            },

           {
                ARG: 'PROFILE_ANSWERS',
                DESC: 'Respuestas',
            },

            {
                ARG: 'PROFILE_BEST_ANSWERS',
                DESC: 'Mejores respuestas',
            },

            {
                ARG: 'PROFILE_PENDING_QUESTION',
                DESC: 'Preguntas pendientes',
            }
        ];

    readonly PROFILETABS = [

        {
            ARG: 'EDIT',
            DESC: 'Editar Perfil',
        },
        {
            ARG: 'CHANGE_PASSWORD',
            DESC: 'Cambiar Contraseña',
        },
        {
            ARG: 'MAIL_SETTINGS',
            DESC: 'Configuración de correo',
        }
    ];

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     * @param {EnviromentsService} _enviroment
     */
    constructor(
        private _httpClient: HttpClient,
        private _enviroment: EnviromentsService)
    {
        super(_httpClient, _enviroment.getEnviroment().apiUrl, 'users');
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._httpClient.get(`${this._enviroment.getEnviroment().apiUrl}/users/${route.params['id']}/profile`)
    }
    saveUser(params) {
        return this.update(params);
    }
    getUser(id): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.routeParams.id === 'new') {
                this.onUserChanged.next(this.routeParams);
                resolve(false);
            } else {

                return this._httpClient.get(`${this._enviroment.getEnviroment().apiUrl}/users/` + id)
                    .subscribe((response: any) => {
                        this.user = response;
                        this.onUserChanged.next(this.user);
                        resolve(response);
                    }, reject);
            }
        });
    }
}
