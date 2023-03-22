import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector   : 'fuse-ask-dialog',
    templateUrl: './ask-dialog.component.html',
    styleUrls  : ['./ask-dialog.component.scss']
})
export class FuseAskDialogComponent
{
    public confirmMessage: string;

    /**
     * Constructor
     *
     * @param {MatDialogRef<FuseAskDialogComponent>} dialogRef
     */
    constructor(
        public dialogRef: MatDialogRef<FuseAskDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {title: string}
    )
    {
    }

}
