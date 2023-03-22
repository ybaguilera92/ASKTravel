import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {DomSanitizer} from "@angular/platform-browser";
import {isNullOrEmpty} from "../../../../fuse-config";
import {EnviromentsService} from "../../../../services/enviroments.service";


@Injectable()
export class QuestionsService implements Resolve<any>
{
    routeParams: any;
    question: any;
    onQuestionsChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private enviroment: EnviromentsService,
        private domSanitizer: DomSanitizer
    )
    {
        // Set the defaults
        this.onQuestionsChanged = new BehaviorSubject({});
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
                this.resolveQuestions()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get questions by route params
     *
     * @returns {Promise<any>}
     */
    resolveQuestions(): Observable<any>{
        if(!isNullOrEmpty(this.routeParams['moreHandle']) && this.routeParams['moreHandle'] === 'true'){
            this.getQuestionsByPhrase(this.routeParams['question']);
        } else
            return new Observable<any>();
    }


    /**
     * Get Question by phrase
     *
     * @returns {Observable<any>}
     */
    getQuestionsByPhrase(id): Observable<any>
    {
        return this._httpClient.get(`${this.enviroment.getEnviroment().apiUrl}/questions/`+id)
    }
}
