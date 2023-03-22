import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {environment} from "../../../../environments/environment";

@Injectable()
export class FaqService
{
    faqs: any;
    onFaqsChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private http: HttpClient
    )
    {
        // Set the defaults
        this.onFaqsChanged = new BehaviorSubject({});
    }

    search(filter?: { question: any }, page = 1) {
        if(filter.question !== ""){
            return this.http.get(`${environment.apiUrl}/question/search`, {
                params: new HttpParams().set('question', filter.question)});
        }
    }
}
