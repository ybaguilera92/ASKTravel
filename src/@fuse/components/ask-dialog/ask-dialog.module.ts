import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { FuseAskDialogComponent } from '@fuse/components/ask-dialog/ask-dialog.component';

@NgModule({
    declarations: [
        FuseAskDialogComponent
    ],
    imports: [
        MatDialogModule,
        MatButtonModule
    ],
    entryComponents: [
        FuseAskDialogComponent
    ],
})
export class FuseAskDialogModule
{
}
