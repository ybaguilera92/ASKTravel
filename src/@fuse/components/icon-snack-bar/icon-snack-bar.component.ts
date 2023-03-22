import {Component, Inject} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';


@Component({
    selector: 'icon-snackbar',
    template: `<mat-icon [ngClass]="{'online': data?.online}">{{ data?.icon }}</mat-icon> <span>{{ data?.message }}</span>,`,
    styleUrls  : ['./icon-snack-bar.component.scss']
})
    export class IconSnackBarComponent {
        constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
    }