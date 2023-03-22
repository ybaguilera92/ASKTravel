import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {environment} from "../../../../environments/environment";
import {map} from "rxjs/operators";

@Injectable()
export class AskService
{


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

    }

    saveQuestion(question: string) {
        return this._httpClient.post<any>(`${environment.apiUrl}/question/create`, { description: question })
            .pipe(map(question => {
                console.log(question);
                return question;
            }));
    }


}
