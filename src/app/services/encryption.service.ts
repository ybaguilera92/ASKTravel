import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class EncryptionService {
    private _environment: any;

    constructor(
    ) {
    }

    initServiceEnvironment(currentEnvironment: any) {
        this._environment = currentEnvironment;
    }

    getBase64Request(request) {
        return btoa(JSON.stringify(request));
    }
}
