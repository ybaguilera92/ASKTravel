import {Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {map, startWith, take, takeUntil} from "rxjs/operators";
import {Tag} from "../../../app/models/tag";
import {FuseUtils} from '@fuse/utils';
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Observable, Subject} from "rxjs";
import {CommonService} from "../../../app/services/common.service";
import {Catalog} from "../../../app/models/catalog";
import {FileValidator} from "../../../app/validators/file.validator";
import {isNullOrEmpty} from "../../../app/fuse-config";
import {AuthenticationService} from "../../../app/services/authentication.service";
import {User} from "../../../app/models/user";
import {TokenStorageService} from "../../../app/services/token.service";

@Component({
    selector: 'fuse-question-dialog',
    templateUrl: './question-dialog.component.html',
    styleUrls: ['./question-dialog.component.scss']
})
export class FuseQuestionDialogComponent implements OnInit, OnDestroy {
    @ViewChild('autosize', {static: false}) autosize: CdkTextareaAutosize;
    @ViewChild('tagInput', {static: false}) tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('fileInput', {static: false}) fileInput: ElementRef;
    allTags: any[] = [];
    tags: any[] = [];
    categories: any[] = [];
    status: any[] = [];
    form: FormGroup;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredTags: Observable<any[]>;
    readonly maxSize = 104857600;
    currentUser: User

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {MatDialogRef<FuseQuestionDialogComponent>} dialogRef
     */
    constructor(
        public dialogRef: MatDialogRef<FuseQuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private formBuilder: FormBuilder,
        private _ngZone: NgZone,
        private commonService: CommonService,
        private _authenticationService: AuthenticationService,
        private tokenStorage: TokenStorageService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit() {

        this.form = this.formBuilder.group({
            'title': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
            'description': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
            'category': ['', Validators.compose([Validators.required])],
            'file': [''],
            'fileUp': [''],
            'tag': [''],
            'tags': ['', Validators.compose([Validators.required])],
        });
        this.commonService.getCatalogs(['TABLA_TAGS', 'TABLA_CATEGORIES', 'TABLA_STATUS']).subscribe(data => {
            this.allTags = data['TABLA_TAGS'].filter(tag => tag.status == 'A');
            this.categories = data['TABLA_CATEGORIES'].filter(cat => cat.status == 'A');
            this.status = data['TABLA_STATUS'].filter(cat => cat.status == 'A');
        });
        this.filteredTags = this.form.controls['tag'].valueChanges.pipe(
            startWith(null),
            map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice())),
        );

        this._authenticationService.currentUser.pipe(takeUntil((this._unsubscribeAll))).subscribe((user) => {
            this.currentUser = !isNullOrEmpty(user) ? user : !isNullOrEmpty(this.tokenStorage.getUser()) ? this.tokenStorage.getUser() : null;
        });
    }

    triggerResize() {
        // Wait for changes to be applied, then trigger textarea resize.
        this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
    }

    //custom validation
    checkFileType(control: AbstractControl): { [key: string]: any } | null {
        const files: File[] = control.value;
        let errors: string[] = [];

        if (files.length >= 1) {
            for (let index = 0; index < files.length; index++) {
                //Use a type list here to check for your types for example "image/jpeg"
                if (files[index].type === '') {
                    errors.push(`${files[index].name} has an invalid type of unknown\n`);
                }
            }

            return errors.length >= 1 ? {invalid_type: errors} : null;
        }
        return null;  // no file, can be capture by "Required" validation
    }

    getRandomColor() {
        let letters = '012345'.split('');
        let color = '#';
        color += letters[Math.round(Math.random() * 5)];
        letters = '0123456789ABCDEF'.split('');
        for (let i = 0; i < 5; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }

    addTag() {
        this.tags.push(new Catalog(FuseUtils.generateGUID(),
            'TABLA_TAGS',
            this.form.controls['tag'].value,
            this.form.controls['tag'].value,
            this.getRandomColor(),
            'I'));
        this.form.controls['tag'].setValue(null);
        this.form.controls['tags'].setValue(this.tags);
    }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our tag
        if (value) {
            this.addTag();
        }

        // Clear the input value
        if (event.input) {
            event.input.value = '';
        }

        this.form.controls['tag'].setValue(null);
    }

    remove(tagSelected: any): void {
        const index = this.tags.findIndex(tag => tagSelected.tablaDescription == tag.tablaDescription);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.tags.push(event.option.value);
        this.tagInput.nativeElement.value = '';
        this.form.controls['tag'].setValue(null);
        this.form.controls['tags'].setValue(this.tags);
    }

    private _filter(value: string): Tag[] {
        const filterValue = value.toLowerCase();

        return this.allTags.filter(tag => tag.tablaDescription.toLowerCase().includes(filterValue));
    }

    makeQuestion() {
       // console.log("hola");
        let params = this.form.getRawValue();
        params.statusCat = this.status[0];
        params.follower = this.currentUser.id;
        //console.log(params);
        this.commonService.makeQuestion(params)
    }

    changeFile(file: any) {
        
        if (file.target.files && file.target.files[0]) {
            if (file.target.files[0].size > 10000000) {
                this.form.controls['file'].setErrors({'maxFileSize': true});
                this.form.controls['file'].markAsTouched();
                return;
            } else if (['image/jpeg', 'image/png', 'image/jpg'].indexOf(file.target.files[0].type) == -1) {
                this.form.controls['file'].setErrors({'typeError': true});
                this.form.controls['file'].markAsTouched();
                return;
            } else {
                this.form.controls['file'].setValue(file.target.files[0].name);
                this.form.controls['fileUp'].setValue(file.target.files[0]);
            }

            this.fileInput.nativeElement.value = "";
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy()
        :
        void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
