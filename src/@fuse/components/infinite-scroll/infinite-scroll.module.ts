import {NgModule} from '@angular/core';

import {InfiniteScrollComponent} from "./infinite-scroll.component";

@NgModule({
    declarations: [
        InfiniteScrollComponent
    ],
    exports: [
        InfiniteScrollComponent
    ],
})
export class InfiniteScrollModule {
}
