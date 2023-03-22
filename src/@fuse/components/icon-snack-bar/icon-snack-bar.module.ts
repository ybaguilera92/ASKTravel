import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import {IconSnackBarComponent} from "./icon-snack-bar.component";
import {MatIconModule} from "@angular/material/icon";
import {CommonModule} from "@angular/common";

@NgModule({
    declarations: [
        IconSnackBarComponent
    ],
    imports: [
        CommonModule,
        MatIconModule
    ],
    entryComponents: [
        IconSnackBarComponent
    ],
})
export class IconSnackBarModule
{
}
