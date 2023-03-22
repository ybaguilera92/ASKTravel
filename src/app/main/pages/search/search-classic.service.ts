import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {environment} from "../../../../environments/environment";
import {isNullOrEmpty} from "../../../fuse-config";

@Injectable()
export class SearchClassicService implements Resolve<any>
{
    data: any;
    dataOnChanged: BehaviorSubject<any>;
    questionOnChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    )
    {
        // Set the defaults
        this.dataOnChanged = new BehaviorSubject({});
        this.questionOnChanged = new BehaviorSubject({});
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
                !isNullOrEmpty(route.queryParams.questionId) ? this.getSearchDataById(route.queryParams.questionId) : this.getSearchData(route.queryParams.question),
                this.questionOnChanged.next(route.queryParams.question)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get search data
     */
    getSearchDataById(questionId): Promise<any[]>
    {
        return new Promise((resolve, reject) => {

            this._httpClient.get(`${environment.apiUrl}/question/${questionId}`)
                .subscribe((data: any) => {
                    this.data = data;
                    this.dataOnChanged.next(this.data);
                    resolve(this.data);
                }, reject);
        });
    }

    /**
     * Get search data
     */
    getSearchData(question): Promise<any[]>
    {
        return new Promise((resolve, reject) => {

            this._httpClient.get(`${environment.apiUrl}/answer/search?question=` + question)
                .subscribe((data: any) => {
                    this.data = data;
                    this.dataOnChanged.next(this.data);
                    resolve(this.data);
                }, reject);
        });
    }
}
