import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector     : 'content1',
    templateUrl  : './content1.component.html',
    styleUrls    : ['./content1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContentComponent1 implements OnInit, OnDestroy {
    /**
     * Constructor
     */
    constructor()
    {
    }
    ngOnInit(): void {
        // if (!sessionStorage.getItem('content')) {
        //     window.location.reload();
        //     sessionStorage.setItem('content','true');
        // }
       
    }
    ngOnDestroy(): void {
        sessionStorage.removeItem('content');
    }
}
