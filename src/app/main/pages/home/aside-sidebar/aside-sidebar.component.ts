import {
    Component,
    OnInit,
    OnDestroy,
    ViewEncapsulation,
    Output,
    EventEmitter,
    ViewChild, ElementRef, AfterViewInit, Input
} from '@angular/core';
import {Subject} from "rxjs";
import {HomeService} from "../home.service";
import {Router} from "@angular/router";
import {FuseDialogService} from "../../../../../@fuse/services/dialog.service";
import {User} from "../../../../models/user";
import {Login2Component} from "../../authentication/login-2/login-2.component";
import {FuseQuestionDialogComponent} from "../../../../../@fuse/components/question-dialog/question-dialog.component";
import {isNullOrEmpty} from "../../../../fuse-config";
import {AuthenticationService} from "../../../../services/authentication.service";
import {TokenStorageService} from "../../../../services/token.service";
import {takeUntil} from "rxjs/operators";
import { DomSanitizer } from '@angular/platform-browser';


@Component({
    selector: 'aside-sidebar',
    templateUrl: './aside-sidebar.componet.html',
    styleUrls: ['./aside-sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AsideSidebarComponent implements OnInit, AfterViewInit, OnDestroy {
    question: any;
    questions: any;
    currentUser: User;
    options = {};
    fixed = false;
    data$: any;
    recents$: any;

    @Output() scrolled = new EventEmitter();
    @ViewChild('theiaStickySidebar', {static: false}) anchor: ElementRef<HTMLElement>;

    private observer: IntersectionObserver;

    // Private
    private _unsubscribeAll: Subject<any>;

    readonly TABS = {
        POPULAR_TAB: 'POPULAR_TAB',
        ANSWER_TAB: 'ANSWER_TAB',
    };
    tab: any;

    /**
     * Constructor
     *
     * @param {FuseDialogService} fuseDialogService
     */
    constructor(
        private fuseDialogService: FuseDialogService,
        private router: Router,
        private _authenticationService: AuthenticationService,
        private tokenStorage: TokenStorageService,
        private host: ElementRef,
        private homeService: HomeService,
        private domSanitizer: DomSanitizer,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    status: any;

    /**
     * On init
     */
    ngOnInit(): void {
        this.tab = this.TABS.POPULAR_TAB;
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this._authenticationService.currentUser
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
            !isNullOrEmpty(user) ? this.currentUser = user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.currentUser = this.tokenStorage.getUser() : null;
        });

        this.homeService.reloadAsideNavBar
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe( res => {
                if(res){
                    this.loadData();
                }
            })
        //error en side bar
        if (!isNullOrEmpty(this.question)) {
            this.photo_url(this.question.user.fileEncode);
           // this.question.user.fileEncode = this.domSanitizer.bypassSecurityTrustUrl("data:image/png;base64, " + this.question.user.fileEncode);
        }
        // if (!isNullOrEmpty(this.question.user.fileEncode)) {
        //     this.question.user.fileEncode = this.domSanitizer.bypassSecurityTrustUrl("data:image/png;base64, " + this.question.user.fileEncode);
        // }
    }
    photo_url(data: string) {
        this.question.user.fileEncode = this.domSanitizer.bypassSecurityTrustUrl("data:image/png;base64, " + data);
    }
    ngAfterViewInit(){
        let observer = new IntersectionObserver(entries => {
            if (entries[0].boundingClientRect['y'] < 0) {
               this.fixed = true;
            }else {
                this.fixed = false;
            }
        });
        observer.observe(document.querySelector("#pixel-to-watch"));
        this.loadData();
    }

    get element() {
        return this.host.nativeElement;
    }

    makeQuestion() {
        if (this.currentUser) {
            this.fuseDialogService.buildDialog(FuseQuestionDialogComponent, {
                width: '690px',
                maxWidth: '690px',
                panelClass: 'question-dialog-container'
            });
        } else {
            this.fuseDialogService.buildDialogStyle(Login2Component, {
                width: '850px'
            });
        }
    }

    private loadData() {
        this.data$ = this.homeService.getTotals();
        this.recents$ = this.homeService.getQuestionAndAnswersRecent();
    }

    activeTab(tab) {
        this.tab = tab;
        return false;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
