import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {Location} from "@angular/common";
import {EnviromentsService} from "./enviroments.service";
import {FuseDialogService} from "../../@fuse/services/dialog.service";
import {FuseSplashScreenService} from "../../@fuse/services/splash-screen.service";
import {Injectable} from "@angular/core";
import {of, BehaviorSubject, Observable, throwError, fromEvent, Observer, merge} from "rxjs";
import {catchError, retry, map} from "rxjs/operators";
import {isNullOrEmpty} from "../fuse-config";
import {DomSanitizer} from "@angular/platform-browser";
import {Router} from "@angular/router";



@Injectable({
    providedIn: 'root'
})
export class CommonService {

    onLoadQuestion: BehaviorSubject<any>;
    onReactionQuestion: BehaviorSubject<boolean>;
    onReactionQuestionError: BehaviorSubject<any>;

    private _profileHeaderInfo: BehaviorSubject<boolean>;
    public profileHeaderInfo: Observable<boolean>;

    constructor(
        private _httpClient: HttpClient,
        private _location: Location,
        private environment: EnviromentsService,
        private _dialog: FuseDialogService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private domSanitizer: DomSanitizer,
        private router: Router
    ) {
        // Set the defaults
        this.onLoadQuestion = new BehaviorSubject({});
        this.onReactionQuestion = new BehaviorSubject(false);
        this.onReactionQuestionError = new BehaviorSubject({});

        this._profileHeaderInfo = new BehaviorSubject<any>(false);
        this.profileHeaderInfo = this._profileHeaderInfo.asObservable();
    }

    /**
     * Get all tags
     *
     * @returns {Observable<any>}
     */
    getCatalogs(catalogs: string []) {
        this._fuseSplashScreenService.show();
        const params = new HttpParams({
            fromObject: {'tablas': catalogs,
                        'type': 'multiple'}
        });
        return this._httpClient.get(`${this.environment.getEnviroment().apiUrl}/catalogs/`, {params})
            .pipe(
                map((data: any) => {
                    this._fuseSplashScreenService.hide();
                    return data;
                })
            );
    }

    /**
     * Make a question
     *
     * @returns {Observable<any>}
     */
    makeQuestion(question): Promise<any> {
        this._fuseSplashScreenService.show();
        return new Promise((resolve, reject) => {
            let params = new FormData();
            params.append('file', new Blob([question.fileUp],
                {
                    type: "multipart/form-data"
                }), question.fileUp.name);

            params.append('data', new Blob([JSON.stringify({
                "title": question.title,
                "description": question.description,
                "tags": question.tags,
                "category": question.category,
                "statusCat": question.statusCat,
                "follower": question.follower,
            })], {
                type: "application/json"
            }));

            const httpHeaders = new HttpHeaders({
                "enctype": "multipart/form-data",
            });

            const options = {
                headers: httpHeaders
            };
          

            this._httpClient.post(`${this.environment.getEnviroment().apiUrl}/questions`, params, options)
                .subscribe((response: any) => {
                    resolve(response);
                    this._fuseSplashScreenService.hide();
                    this._dialog.close();
                   // console.log(params)
                   /// this.router.navigate(['/question', response.data.id]);
                }, reject);
        });
    }

    /**
     * Get questions by params
     *
     * @param handle
     * @returns {Observable<any>>}
     */
    getQuestionsByParams(params: HttpParams, fromProfile = false):Observable<any> {
        let endPoint = fromProfile ? `${this.environment.getEnviroment().apiUrl}/profiles/questions/` : `${this.environment.getEnviroment().apiUrl}/questions/`;
      return this._httpClient.get(endPoint, {params})
            .pipe(
                map(data => {
                    const request = params.keys().map(x => ({ [x]: params.get(x) }));
                    if(request['2'].type != 'PROFILE_PENDING_QUESTION' && request['2'].type != 'PROFILE_QUESTION'){
                        data['questions'] = data['questions'].filter(question => !isNullOrEmpty(question.status.find(status => status.tablaArgumento != 'Nueva')));
                    }
                    data['questions'].map(question => {
                        if (!isNullOrEmpty(question.fileEncode)) {
                            question.fileEncode = this.domSanitizer.bypassSecurityTrustUrl("data:image/png;base64, " + question.fileEncode);
                        }
                    });
                    return data;
                }),
                retry(1)
            )
    }

    /**
     * Get answers by params
     *
     * @param handle
     * @returns {Observable<any>>}
     */
    getAnswersByParams(params: HttpParams, fromProfile = false):Observable<any> {
        let endPoint = fromProfile ? `${this.environment.getEnviroment().apiUrl}/profiles/answers` : `${this.environment.getEnviroment().apiUrl}/answers`;
        return this._httpClient.get(endPoint, {params});
    }

    /**
     * Vote by questions
     *
     * @param user
     * @returns {Promise<any>}
     */
    vote(params): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${this.environment.getEnviroment().apiUrl}/reactions`, {
                "objectId": params.question,
                "reaction": params.reaction,
                "type": params.type,
            }).pipe(map(response => response),
                catchError((e: any) => {
                    //do your processing here
                    this.onReactionQuestionError.next({
                        status: true,
                        error: e['error'].error
                    });
                    return throwError(e);
                }))
                .subscribe((response: any) => {
                    this.onReactionQuestion.next(true);
                    resolve(response);

                }, reject);
        });
    }

    /**
     * Get reactions
     *
     * @returns {Observable<any>}
     */
    getReactions(id, type): Observable<any> {
        return this._httpClient.get(`${this.environment.getEnviroment().apiUrl}/reactions/` + id + `/` + type)
            .pipe(
                map(response => {
                    return (response['data']);
                })
            );
    }

    /**
     * Find questions
     *
     * @returns {Observable<any>}
     */
    search(handle) {
        let params;
        if (!isNullOrEmpty(handle)) {
            params = new HttpParams({
                fromObject: {
                    type: 'BY_PHRASE',
                    pageNo: !isNullOrEmpty(handle.pageIndex) ? handle.pageIndex : 0,
                    pageSize: !isNullOrEmpty(handle.pageSize) ? handle.pageSize : 5,
                    phrase: handle!.phrase,
                }
            });
        }
        if (handle!.phrase !== "") {
            return this._httpClient.get<any[]>(`${this.environment.getEnviroment().apiUrl}/questions/`, {params});
        }
    }
    /**
     * Get checkInternetConnection
     *
     * Return an observable with a boolean based on internet connection status
     */
    public checkInternetConnection(): Observable<boolean> {
        return merge<boolean>(
            fromEvent(window, 'offline').pipe(map(() => false)),
            fromEvent(window, 'online').pipe(map(() => true)),
            new Observable((sub: Observer<boolean>) => {
                sub.next(navigator.onLine);
                sub.complete();
            }));
    }

    setProfileHeaderInfo(value){
        this._profileHeaderInfo.next(value)
    }
}