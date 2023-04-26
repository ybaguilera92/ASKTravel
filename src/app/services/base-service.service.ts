import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import {FuseError} from "../../@fuse/types/fuse-error";

// @Injectable({
//     providedIn: 'root'
// })
export class BaseService<T> {

    constructor(
        private httpClient: HttpClient,
        private url: string,
        private endpoint: string,
    ) { }

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    //#region [ Public ]
    get(params: HttpParams): Observable<T[]> {
        return this.httpClient
            .get<T[]>(`${this.url}/${this.endpoint}`, {params})
            .pipe(
                retry(2),

            )
    }

    getById(id: number): Observable<T> {
        return this.httpClient
            .get<T>(`${this.url}/${this.endpoint}/${id}`)
            .pipe(
                retry(2),

            )
    }

    create(item: T): Observable<T> {
        return this.httpClient.post<T>(`${this.url}/${this.endpoint}`, JSON.stringify(item), this.httpOptions)
            .pipe(
                retry(2),

            )
    }

    update(item: T): Observable<T> {
       // console.log(`${this.url}/${this.endpoint}/`);
        return this.httpClient.put<T>(`${this.url}/${this.endpoint}/`, JSON.stringify(item), this.httpOptions)
            .pipe(
                retry(2),

            )
    }

    delete(item: T) {
        return this.httpClient.delete<T>(`${this.url}/${this.endpoint}/`, this.httpOptions)
            .pipe(
                retry(2),

            )
    }
    //#endregion

}