import { Directive, Input } from '@angular/core';

import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Directive({
    selector: '[readOnly]',
    host: {
        '[attr.readonly]': '_isReadonly ? "" : null'
    }
})
export class ReadOnlyDirective
{
    _isReadonly = false;

    @Input() set readonly (v) {
        this._isReadonly = coerceBooleanProperty(v);
    };

}
