import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
import { NavigationEnd, Router } from '@angular/router';
import {filter, map, take} from 'rxjs/operators';
import {FuseConfirmDialogComponent} from "../components/confirm-dialog/confirm-dialog.component";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {Observable} from "rxjs";
import { FuseQuestionDialogComponent } from "../components/question-dialog/question-dialog.component";
import {isNullOrEmpty} from "../../app/fuse-config";

export class DialogOption {
    title: string;
    message: string;
    buttonText?: {
        ok?: {
            title: string,
        },
        cancel?: {
            title: string,
        },
    };
    disableClose?: boolean;
    panelClass?: string;
}

export const DIALOG_TYPES = {
    confirmDialog : FuseConfirmDialogComponent,
    alertDialog : FuseConfirmDialogComponent,
};

@Injectable({
    providedIn: 'root'
})
export class FuseDialogService
{

    dialogRef: MatDialogRef<any>

    /**
     * Constructor
     *
     * @param {AnimationBuilder} _animationBuilder
     * @param _document
     * @param {Router} _router
     */
    constructor(
        private _animationBuilder: AnimationBuilder,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _dialog: MatDialog
    )
    {

    }


    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

     constructDialog<T>(TCtor: new (...args: any[]) => T, data: any): MatDialogRef<T,any> {
        const dialogRef = this._dialog.open(TCtor, data);
        return dialogRef;
    }

    /**
     * Dialog Confirm
     *
     * @private
     */

    openDialog(options: DialogOption) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = !isNullOrEmpty(options.disableClose) ? options.disableClose : false;
        dialogConfig.data = options;
        this.dialogRef = this.constructDialog(DIALOG_TYPES.confirmDialog, dialogConfig);
    }

    buildDialogStyle(type, options){
        this.close();
        this.dialogRef = this.constructDialog(type, options);
        if(document.getElementsByTagName('mat-dialog-container')){
            Array.from(document.getElementsByClassName('mat-dialog-container')).forEach( dc => dc.classList.add('padding-0'));
        }
    }

    buildDialog(type, options){
        this.close();
        this.dialogRef = this.constructDialog(type, options);
    }

    public confirmed(): Observable<any> {
        return this.dialogRef.afterClosed().pipe(take(1), map(res => {
                return res;
            }
        ));
    }

    close(){
        this._dialog.closeAll();
    }

}
