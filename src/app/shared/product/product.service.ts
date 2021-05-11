import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {HTTP, HTTPResponse} from '@ionic-native/http/ngx';

@Injectable()
export class ProductService {
  bearer: string;

    constructor(
        private http: HTTP,
    ) {
    }

    /**
     * Creates the request to retrieve a product for the given ean.
     */
    productForEan(ean: string): Observable<HTTPResponse> {
      this.http.setHeader('*', String('Content-Type'), String('application/json'));
      this.http.setHeader('*', String('Accept'), String('application/json'));

      this.http.setDataSerializer('json');

        return from(this.http.get(`https://app.kroon.nl/api/product/ean/${ean}`, {},       {}));
    }

}
