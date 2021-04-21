import { HttpClient, HttpHeaders } from '@angular/common/http';
// import '@capacitor-community/http';
// import { Plugins } from '@capacitor/core';
// const { Http } = Plugins;


// import { Constants } from '../constants';


import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable()
export class AuthService {

    constructor(
        private http: HttpClient
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
    logIn(email: string, password: string): Observable<string> {
        const body = {
            email,
            password
        };
        console.log('hier')
        return this.http.post<string>(`https://app.kroon.nl/api/login`, body, { headers: this.headers });
    }

}
