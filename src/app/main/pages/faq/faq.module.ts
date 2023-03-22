import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { FuseSharedModule } from '@fuse/shared.module';

import { FaqService } from 'app/main/pages/faq/faq.service';
import { FaqComponent } from 'app/main/pages/faq/faq.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FusePipesModule} from "../../../../@fuse/pipes/pipes.module";
import {MatButtonModule} from "@angular/material/button";

const routes = [
    {
        path     : '',
        component: FaqComponent
    }
];

@NgModule({
    declarations: [
        FaqComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatExpansionModule,
        MatIconModule,

        FuseSharedModule,
        MatAutocompleteModule,
        FusePipesModule,
        MatButtonModule
    ],
    providers   : [
        FaqService
    ]
})
export class FaqModule
{
}
