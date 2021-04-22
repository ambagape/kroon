import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { Constants } from '../constants';

@Injectable()
export class ProductService {

    constructor(
        private http: HttpClient
    ) {

    }

    private get headers(): HttpHeaders {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        return headers;
    }

    /**
     * Creates the request to retrieve a product for the given ean.
     */
    productForEan(ean: string): Observable<string> {
        return this.http.get<string>(`http://app.kroon.nl/product/ean/${ean}`, { headers: this.headers });
    }

}
