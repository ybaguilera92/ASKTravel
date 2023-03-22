import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import {environment} from "../../../../environments/environment";
import {CommonService} from "../../../services/common.service";
import {LinkedList} from "../../../models/linked-list/linked.list";
import {isNullOrEmpty} from "../../../fuse-config";
import {map, takeUntil} from "rxjs/operators";

const NAVIGATION = 'navigation';

@Injectable()
export class HomeService {
    onFaqsChanged: BehaviorSubject<any>;

    readonly NAVIGATION = {
        MOST_ANSWERED: 'MOST_ANSWERED',
        MOST_VISITED: 'MOST_VISITED',
        MOST_VOTED: 'MOST_VOTED',
        RECENT_QUESTIONS: 'RECENT_QUESTIONS',
        BY_PHRASE: 'BY_PHRASE'
    };

    // used in nav bar left
    private _searchQuestionSubject: BehaviorSubject<String>
    public searchQuestionObservable: Observable<String>

    private _reloadAsideNavBar: BehaviorSubject<boolean>;
    public reloadAsideNavBar: Observable<boolean>;

    private dataSubject$: BehaviorSubject<any>;
    public data$: Observable<any>;

    private _activeNavigation;
    private _dataNavigation = new LinkedList();
    private _pageIndex = 0;
    private _pageSize = 5;
    private _end = false;


    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        // Set the defaults
        this.onFaqsChanged = new BehaviorSubject({});
        this._searchQuestionSubject = new BehaviorSubject<String>('');
        this.searchQuestionObservable = this._searchQuestionSubject.asObservable();

        this._reloadAsideNavBar = new BehaviorSubject<any>(false);
        this.reloadAsideNavBar = this._reloadAsideNavBar.asObservable();

        this.dataSubject$ = new BehaviorSubject<any>(false);
        this.data$ = this.dataSubject$.asObservable();

        const data = this.getDataNavigation();

        if (!isNullOrEmpty(data)) {
            this.pageIndex = data['pageIndex'];
            this.pageSize = data['pageSize'];
            this.activeNavigation = data['activeNavigation'];
        }
    }

    search(filter?: { question: any }, page = 1) {
        if (filter.question !== "") {
            return this.http.get(`${environment.apiUrl}/question/search`, {
                params: new HttpParams().set('question', filter.question)
            });
        }
    }

    setSearchQuestionSubject(criteria) {
        this._searchQuestionSubject.next(criteria)
    }

    setReloadAsideNavBar(value) {
        this._reloadAsideNavBar.next(value);
    }

    getTotals() {
        return forkJoin([
            this.http.get(`${environment.apiUrl}/questions/count`),
            this.http.get(`${environment.apiUrl}/answers/count`),
            this.http.get(`${environment.apiUrl}/users/count`),
        ])
    }

    getQuestionAndAnswersRecent() {
        return forkJoin([
            this.commonService.getQuestionsByParams(new HttpParams()
                .set('pageIndex', '0')
                .set('pageSize', '3')
                .set('type', this.NAVIGATION.MOST_VISITED)),

            this.commonService.getAnswersByParams(new HttpParams()
                .set('pageIndex', '0')
                .set('pageSize', '3')
                .set('type', this.NAVIGATION.MOST_VOTED))
        ])
    }

    set activeNavigation(activeNavigation) {
        this._activeNavigation = activeNavigation;
    }

    get activeNavigation() {
        return this._activeNavigation;
    }

    set dataNavigation(dataNavigation) {
        this._dataNavigation = dataNavigation;
    }

    get dataNavigation() {
        return this._dataNavigation;
    }

    set pageIndex(pageIndex) {
        this._pageIndex = pageIndex;
    }

    get pageIndex() {
        return this._pageIndex;
    }

    set pageSize(pageSize) {
        this._pageSize = pageSize;
    }

    get pageSize() {
        return this._pageSize;
    }

    set end(end) {
        this._end = end;
    }

    get end() {
        return this._end;
    }

    /**
     * Find questions by type
     */
    goTo(type, fromProfile = false) {
        if (this._activeNavigation != type) {
            this.activeNavigation = type;
            this.pageIndex = 0;
            this.pageSize = 5;
            this.end = false;
            this.dataNavigation = new LinkedList<any>();
        }
        if (!this.end) {
            this.commonService.getQuestionsByParams(new HttpParams()
                .set('pageIndex', this.pageIndex.toString())
                .set('pageSize', this.pageSize.toString())
                .set('type', this._activeNavigation),
                fromProfile)
                .subscribe(data => {
                    this.end = data['questions'].length == data['totalItems'];
                    this.dataSubject$.next(data);
                    let dataNavigation = new LinkedList();
                    data['questions'].forEach(question => dataNavigation.insertAtEnd(question));
                    this.dataNavigation = dataNavigation;
                    this.saveDataNavigation();
                    this.pageSize += 5;
                });
        }
    }

    /**
     * Find answers by type
     */
    goToAnswers(type, fromProfile = false) {
        if (this._activeNavigation != type) {
            this.activeNavigation = type;
            this.pageIndex = 0;
            this.pageSize = 5;
            this.end = false;
        }
        if (!this.end) {
            this.commonService.getAnswersByParams(new HttpParams()
                    .set('pageIndex', this.pageIndex.toString())
                    .set('pageSize', this.pageSize.toString())
                    .set('type', this._activeNavigation),
                fromProfile)
                .subscribe(data => {
                    this.end = data['answers'].length == data['totalItems'];
                    this.dataSubject$.next(data);
                    this.saveDataNavigation();
                    this.pageSize += 5;
                });
        }
    }

    public saveDataNavigation(): void {
        window.sessionStorage.removeItem(NAVIGATION);
        window.sessionStorage.setItem(NAVIGATION, JSON.stringify({
            pageIndex: this._pageIndex,
            pageSize: this._pageSize,
            activeNavigation: this._activeNavigation,
        }));
    }

    public getDataNavigation(): void {
        const data = window.sessionStorage.getItem(NAVIGATION);
        if (data) {
            return JSON.parse(data);
        }
    }
}
