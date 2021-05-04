import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {from, Observable} from 'rxjs';
import {HTTP, HTTPResponse} from '@ionic-native/http/ngx';
// import { Constants } from '../constants';
import { NativeStorage} from "@ionic-native/native-storage/ngx";

@Injectable()
export class ProductService {

    constructor(
        private http: HTTP,
        private nativeStorage: NativeStorage
    ) {

    }

    // private get headers(): void {
      // const headers = new HttpHeaders();
      // headers.append('Content-Type', 'application/json');
      // headers.append('Accept', 'application/json');
      //
      // headers.append('Access-Control-Allow-Origin' , '*');
      // headers.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
      //
      // headers.append('Accept','application/json');
      // headers.append('content-type','application/json');

      // const headers = new Headers();
      // headers.append('Content-Type', 'application/x-www-form-urlencoded');
      // headers.append('Accept', 'application/json');
      // headers.append('Authorization', 'Bearer ' + token);
      //
      // let options = new RequestOptions({ headers: headers });

    // }

    /**
     * Creates the request to retrieve a product for the given ean.
     */
    productForEan(ean: string): Observable<HTTPResponse> {
      // this.http.setHeader('*', 'Content-Type', 'application/json');
      // this.http.setHeader('*', 'Accept', 'application/json');
      this.http.setHeader('*', String("Content-Type"), String("application/json"));
      this.http.setHeader('*', String("Accept"), String("application/json"));
      // this.nativeStorage.getItem('token').then(token => {
      //   console.log(token + ' het')
      //   // this.http.setHeader('*', 'Authorization', `Bearer ${token}`);
      // }).catch(err => console.log(JSON.stringify(err) + ' Dit is eenm erropr'));
      this.http.setHeader('*', 'Authorization', 'Bearer eb4ec0e140659545eda6d8ee5dc8dd0f33abf4a0')
      this.http.setDataSerializer('json');
      // console.log(`https://app.kroon.nl/api/product/ean/${ean}`);
      // this.http.get(`https://app.kroon.nl/api/product/ean/${ean}`, {}, { headers: this.headers }).then(res => console.log(JSON.stringify(res.data)));
        return from(this.http.get(`https://app.kroon.nl/api/product/ean/${ean}`, {},       {}));
    }

}
