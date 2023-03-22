import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {EnviromentsService} from "../../../../../services/enviroments.service";
import {isNullOrEmpty} from "../../../../../fuse-config";
import {DomSanitizer} from "@angular/platform-browser";
import {HomeService} from "../../home.service";
import {map} from "rxjs/operators";
import {LinkedList} from "../../../../../models/linked-list/linked.list";
import {CommonService} from "../../../../../services/common.service";


@Injectable()
export class QuestionService implements Resolve<any>
{
    routeParams: any;
    question: any;
    onQuestionChanged: BehaviorSubject<any>;
    onSelectBestAnswer: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private enviroment: EnviromentsService,
        private domSanitizer: DomSanitizer,
        private homeService: HomeService,
        private commonService: CommonService
    )
    {
        // Set the defaults
        this.onQuestionChanged = new BehaviorSubject({});
        this.onSelectBestAnswer = new BehaviorSubject({});
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
                this.getQuestion(this.routeParams['id'])
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }


    /**
     * Get Question by Id
     *
     * @returns {Promise<any>}
     */
    getQuestion(id): Promise<any>
    {
        return new Promise((resolve, reject) => {
            if ( this.routeParams.id === 'new' )
            {
                this.onQuestionChanged.next(this.routeParams);
                resolve(false);
            }
            else
            {
                return this._httpClient.get(`${this.enviroment.getEnviroment().apiUrl}/questions/`+id)
                    .subscribe((response: any) => {
                        this.question = response;
                        if(!isNullOrEmpty(this.question.fileEncode)){
                            this.question.fileEncode = this.domSanitizer.bypassSecurityTrustUrl("data:image/png;base64, "+ this.question.fileEncode);
                        }                      
                        if(isNullOrEmpty(this.homeService.dataNavigation)){
                            this.commonService.getQuestionsByParams(new HttpParams()
                                .set('pageIndex', this.homeService.pageIndex.toString())
                                .set('pageSize', '5')
                                .set('type', this.homeService.activeNavigation))
                                .pipe(
                                    map(data => {
                                        data['questions'] = data['questions'].filter(question => !isNullOrEmpty(question.status.find(status => status.tablaArgumento != 'Nueva')));
                                        return data;
                                    })
                                ).subscribe(data => {
                                let dataNavigation = new LinkedList<any>();
                                data['questions'].forEach(question => dataNavigation.insertAtEnd(question));
                                this.homeService.dataNavigation = dataNavigation;
                                this.onQuestionChanged.next(this.question);
                            });
                        } else{
                            this.onQuestionChanged.next(this.question);
                        }
                        resolve(response);
                    }, reject);
            }
        });
    }

    /**
     * Update Answer
     */
    updateAnswer(answer){
      return this._httpClient.put(`${this.enviroment.getEnviroment().apiUrl}/answers/`, answer);
    }
}
