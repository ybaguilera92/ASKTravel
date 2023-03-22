import {
    Component,
    OnInit,
    OnDestroy,
    ViewEncapsulation,
    Renderer2,
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


@Component({
    selector: 'nav-bar-left',
    templateUrl: './nav-bar-left.componets.html',
    styleUrls: ['./nav-bar-left.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavBarLeftComponent implements OnInit, AfterViewInit, OnDestroy {

    question: any;
    questions: any;
    currentUser: User;
    options = {};
    fixed = false;

    @Output() scrolled = new EventEmitter();
    @ViewChild('theiaStickySidebar', {static: false}) anchor: ElementRef<HTMLElement>;

    private observer: IntersectionObserver;

    readonly NAVIGATION = this.homeService.NAVIGATION;

    // Private
    private _unsubscribeAll: Subject<any>;

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
        public homeService: HomeService
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
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this._authenticationService.currentUser
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
            !isNullOrEmpty(user) ? this.currentUser = user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.currentUser = this.tokenStorage.getUser() : null;
        });
    }

    goTo(criteria){
        this.status = criteria;
        this.homeService.setSearchQuestionSubject(criteria);
        return false;
    }

    ngAfterViewInit(){
        let observer = new IntersectionObserver(entries => {
            if (entries[0].boundingClientRect['y'] < 0) {
               this.fixed = true;
            } else {
                this.fixed = false;
            }
        });
        observer.observe(document.querySelector("#pixel-to-watch"));
    }

    get element() {
        return this.host.nativeElement;
    }

    private isHostScrollable() {
        const style = window.getComputedStyle(this.element);

        return style.getPropertyValue('overflow') === 'auto' ||
            style.getPropertyValue('overflow-y') === 'scroll';
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

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
