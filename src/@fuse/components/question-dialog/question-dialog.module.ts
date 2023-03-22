import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import {CommonModule} from "@angular/common";
import {FuseQuestionDialogComponent} from "./question-dialog.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatMenuModule} from "@angular/material/menu";
import {FusePipesModule} from "../../pipes/pipes.module";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatChipsModule} from "@angular/material/chips";
import {MatSelectModule} from "@angular/material/select";
import {BrowserModule} from "@angular/platform-browser";
import {MatToolbarModule} from "@angular/material/toolbar";
import {EditorModule} from "@tinymce/tinymce-angular";


@NgModule({
    declarations: [
        FuseQuestionDialogComponent
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        MatMenuModule,
        FusePipesModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatSelectModule,
        BrowserModule,
        MatToolbarModule,
        EditorModule
    ],
    entryComponents: [
        FuseQuestionDialogComponent
    ],
})
export class FuseQuestionDialogModule
{}
