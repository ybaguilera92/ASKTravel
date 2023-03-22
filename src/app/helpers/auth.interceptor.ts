import {HTTP_INTERCEPTORS, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';


import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, filter, switchMap, take} from 'rxjs/operators';
import {TokenStorageService} from "../services/token.service";
import {AuthenticationService} from "../services/authentication.service";
import {DialogOption, FuseDialogService} from "../../@fuse/services/dialog.service";
import {Router} from "@angular/router";
import Swal from "sweetalert2";
import {FuseSplashScreenService} from "../../@fuse/services/splash-screen.service";

const TOKEN_HEADER_KEY = 'Authorization';  // for Spring Boot back-end
//const TOKEN_HEADER_KEY = 'x-access-token';    // for Node.js Express back-end

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private tokenService: TokenStorageService,
                private authService: AuthenticationService,
                private _fuseSplashScreenService: FuseSplashScreenService,
                private _dialog: FuseDialogService,
                private _router: Router) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
        let errorMessage = '';
        let authReq = req;
        const token = this.tokenService.getToken();
        if (token != null) {
            authReq = this.addTokenHeader(req, token);
        }

        return next.handle(authReq).pipe(catchError(error => {

            if (error instanceof HttpErrorResponse && !authReq.url.includes('auth/signin') && error.status === 401) {
                return this.handle401Error(authReq, next);
            }

            if (error instanceof HttpErrorResponse && !authReq.url.includes('auth/signin') && error.status === 403) {
                errorMessage = 'Su tiempo de sesión ha expirado, por favor autentíquese de nuevo';
            }

            if (error.error instanceof ErrorEvent) {
                // client-side error
                errorMessage = `Error: ${error.error.message}`;
            } else if (error.status !== 400 && error.status !== 403) {
                console.log('interceptor')
                // server-side error
                errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
                switch (error.error.type) {
                    case 'BadCredentialsException' :
                        errorMessage = 'Credenciales inválidas';
                        break;
                    case 'error':
                        errorMessage = 'Ha ocurrido un error inesperado. Verifíque su conexión o contácte a nuestro servicio de asistencia técnica';
                        break
                }
            }

            if (errorMessage != '')
                Swal.fire({
                    title: 'Estimado Usuario',
                    text: errorMessage,
                    icon: 'info'
                }).then(confirmed =>{
                    if(confirmed && error.status === 403){
                        this._router.navigate(['auth/login']);
                    }
                });

            this._fuseSplashScreenService.hide();
            return throwError(error);
        }));
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            const token = this.tokenService.getRefreshToken();

            if (token)
                return this.authService.refreshToken(token).pipe(
                    switchMap((token: any) => {
                        this.isRefreshing = false;

                        this.tokenService.saveToken(token.accessToken);
                        this.refreshTokenSubject.next(token.accessToken);

                        return next.handle(this.addTokenHeader(request, token.accessToken));
                    }),
                    catchError((err) => {
                        this.isRefreshing = false;

                        this.tokenService.signOut();
                        this.authService.setCurrentUserSubject(null);
                        this.authService.setUserLoggedInSubject(false);

                        return throwError(err);

                    })
                );
        }

        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next.handle(this.addTokenHeader(request, token)))
        );
    }

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        /* for Spring Boot back-end */
        // return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });

        /* for Node.js Express back-end */
        return request.clone({headers: request.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`)});
    }
}

export const authInterceptorProviders = [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
];