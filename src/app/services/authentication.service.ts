import { Router } from '@angular/router';
import { Route } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { User } from "../models/user";
import { DialogOption, FuseDialogService } from "../../@fuse/services/dialog.service";
import { FuseSplashScreenService } from "../../@fuse/services/splash-screen.service";
import { TokenStorageService } from "./token.service";
import { isNullOrEmpty } from "../fuse-config";



@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    private isUserLoggedInSubject: BehaviorSubject<boolean>;
    public isUserLogged: Observable<boolean>;

    constructor(private http: HttpClient,
        private _dialog: FuseDialogService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private tokenStorageService: TokenStorageService,
        private router: Router) {

        this.currentUserSubject = new BehaviorSubject<User>(this.tokenStorageService.getUser());
        this.currentUser = this.currentUserSubject.asObservable();

        this.isUserLoggedInSubject = new BehaviorSubject<boolean>(!isNullOrEmpty(this.tokenStorageService.getUser()));
        this.isUserLogged = this.isUserLoggedInSubject.asObservable();

        if (!isNullOrEmpty(this.tokenStorageService.getUser())) {
            this.currentUserSubject.next(this.tokenStorageService.getUser());
            this.isUserLoggedInSubject.next(true);
        }
    }

    setCurrentUserSubject(value) {
        this.currentUserSubject.next(value);
    }

    setUserLoggedInSubject(value) {
        this.isUserLoggedInSubject.next(value);
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/auth/signin`, { username, password }, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        })
            .pipe(map(user => {              
                if (user.accessToken != "Usuario inactivo") {
                    this.currentUserSubject.next(user);
                    this.isUserLoggedInSubject.next(true);
                } else { 
                    this.isUserLoggedInSubject.next(false);
                }
                return user;
            }));
    }
    recovery(body: any) {
        body.siteURL = `${environment.appUrl}/auth/recovery-password`;
        return this.http.post<any>(`${environment.apiUrl}/auth/recoveryPassword`, body)      
            .pipe(map(user => {             
            }));
    }

    register(body: any) {
        
        body.password_confirmation = body.passwordConfirm;
        body.siteURL = `${environment.appUrl}/auth/activate`;
        return this.http.post<any>(`${environment.apiUrl}/auth/signup`, body)
            .pipe(map(user => {
                return user;
            }));
    }

    activate(token: any) {
        let params = new HttpParams().set("code", token); //Create new HttpParams
        return this.http.get<any>(`${environment.apiUrl}/auth/verify`, { params })
            .pipe(map(user => {               
                return user;
            }));
    }
    recoverPassword(token: any) {
        let params = new HttpParams().set("code", token); //Create new HttpParams       
        return this.http.get<any>(`${environment.apiUrl}/auth/verifyPassword`, { params })
            .pipe(map(user => {                
                return user;
            }));
    }
    logout() {      
        
        this._fuseSplashScreenService.show();
        this.tokenStorageService.signOut();
        this.currentUserSubject.next(null);
        this.isUserLoggedInSubject.next(false);
        let options: DialogOption = {
            title: 'Información:',
            message: "Sesión cerrada satisfactoriamente. Puede seguir consultando preguntas en el sistema.",
        }       
        this._fuseSplashScreenService.hide();
        this._dialog.openDialog(options);        
        this.router.navigate(['/']);      
    }

    refreshToken(token: string) {
        return this.http.post(`${environment.apiUrl}/auth/refreshtoken`, {
            refreshToken: token
        });
    }
}