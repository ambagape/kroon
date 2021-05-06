import { HttpClient, HttpHeaders } from '@angular/common/http';
// import '@capacitor-community/http';
const { Http } = Plugins;
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

// import { Constants } from '../constants';


import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
import {HTTP, HTTPResponse} from '@ionic-native/http/ngx';


@Injectable()
export class AuthService {

    constructor(
      private http: HTTP
    ) {

    }

    private get headers(): HttpHeaders {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Access-Control-Allow-Origin' , '*');
        headers.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');

      // headers.append('Accept','application/json');
        // headers.append('content-type','application/json');
        return headers;
    }

    /**
     * Creates the request to log in with the given email and password.
     */
    logIn(email: string, password: string): Observable<HTTPResponse> {
        const body = {
            email,
            password
        };
        this.http.setHeader('*', String('Content-Type'), String('application/json'));
        this.http.setHeader('*', String('Accept'), String('application/json'));
        this.http.setDataSerializer('json');

        return from(this.http.post(`https://app.kroon.nl/api/login`, body, {}));
    }

}
