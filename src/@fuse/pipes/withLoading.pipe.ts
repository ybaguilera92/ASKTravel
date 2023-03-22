import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

export interface ObsWithStatusResult<T> {
    loading?: boolean;
    data?: T;
    error?: string;
}

const defaultError = 'Something went wrong';

@Pipe({
    name: 'withLoading',
})
export class WithLoadingPipe implements PipeTransform {
    transform<T = any>(val: Observable<T>): Observable<ObsWithStatusResult<T>> {
        return val.pipe(
            map(( value: any) => {
                return {
                    loading: value.type === 'start',
                    type: value.type,
                    error: value.type === 'error' ? defaultError : '',
                    data: value.type ? value.data : value,
                };
            }),
            startWith({ loading: true }),
            catchError(error => of({ loading: false, error: typeof error === 'string' ? error : defaultError }))
        );
    }
}
