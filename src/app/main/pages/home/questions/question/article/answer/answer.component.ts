import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";

import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {FuseConfigService} from "../../../../../../../../@fuse/services/config.service";
import {HomeService} from "../../../../home.service";
import {AuthenticationService} from "../../../../../../../services/authentication.service";
import {FuseDialogService} from "../../../../../../../../@fuse/services/dialog.service";
import {TokenStorageService} from "../../../../../../../services/token.service";
import {QuestionService} from "../../question.service";
import {User} from "../../../../../../../models/user";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommonService} from "../../../../../../../services/common.service";
import {objectType, templateType} from "../../../../generic.model";
import {AddCommentService} from "../add-comment/add-comment.service";
import { UserService } from 'app/main/pages/admin/user/user/user.service';


@Component({
    selector     : 'answer',
    templateUrl  : './answer.component.html',
    styleUrls    : ['./answer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AnswerComponent implements OnInit,  OnDestroy
{
    @Input() public answer: any;
    currentUser: User;
    objectType = objectType;
    templateType = templateType;
    comments$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    best$: Observable<any>;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {HomeService} _faqService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private router: Router,
        private route: ActivatedRoute,
        private _authenticationService: AuthenticationService,
        public fuseDialogService: FuseDialogService,
        private tokenStorage: TokenStorageService,
        private questionService: QuestionService,
        private _matSnackBar: MatSnackBar,
        private commonService: CommonService,
        private addCommentService: AddCommentService,
        private userService: UserService
    )
    {

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: false
                },
                sidepanel: {
                    hidden: false
                }
            }
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    end = false;
    objetoJson: any;

    /**
     * On init
     */
    ngOnInit(): void
    {
        setTimeout(()=>{
            this.route.fragment.subscribe(f => {
                const element = document.querySelector("#" + f)
                if (element) element.scrollIntoView()
            })
        }, 300);

        this.addCommentService.getComments().
        pipe(takeUntil((this._unsubscribeAll))).subscribe( answer => {
            if(this.answer.id === answer['id']){
                this.comments$.next(answer['comments'])
            }
        });
        this.comments$.next(this.answer.comments);
        this.best$ = this.questionService.onSelectBestAnswer.asObservable();
        if(this.answer.best){
            this.questionService.onSelectBestAnswer.next(this.answer);
        }
    }
    convertir(id: number) : String{ 
        
        this.userService.getById(id).subscribe({
            next: (c) => {
                this.objetoJson = c;
                console.log(this.objetoJson);

            },
            error: (err) => {
                if (err.status == 400 || err.status == 409) {
                    console.log(err.error.message);
                }
            }
        });
        return this.objetoJson.name;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    { // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

    }
}