import { HttpClient, HttpHeaders } from '@angular/common/http';

// import { Constants } from '../constants';
import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
// import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';
import {HTTP, HTTPResponse} from '@ionic-native/http/ngx';



@Injectable()
export class OrderService {

    constructor(
        private http: HTTP
    ) {
      this.http.setHeader('*', String('Content-Type'), String('application/json'));
      this.http.setHeader('*', String('Accept'), String('application/json'));
      // this.nativeStorage.getItem('token').then(token => {
      //   console.log(token + ' het')
      //   // this.http.setHeader('*', 'Authorization', `Bearer ${token}`);
      // }).catch(err => console.log(JSON.stringify(err) + ' Dit is eenm erropr'));
      // this.http.setHeader('*', 'Authorization', 'Bearer eb4ec0e140659545eda6d8ee5dc8dd0f33abf4a0');
      this.http.setDataSerializer('json');

    }

    private get headers(): HttpHeaders {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        return headers;
    }

    /**
     * Creates the request to retrieve the delivery addresses.
     */
    addresses(): Observable<HTTPResponse> {
        return from(this.http.get(`https://app.kroon.nl/api/shipping/addresses`, {}, {}));
    }

    /**
     * Creates the request to retrieve the delivery addresses.
     */
    paymentAddresses(): Observable<HTTPResponse> {
        return from(this.http.get(`https://app.kroon.nl/api/payment/addresses`, {}, {}));
    }

    /**
     * Creates the request to retrieve the delivery addresses.
     */
    defaultAddress(): Observable<HTTPResponse> {
        return from(this.http.get(`https://app.kroon.nl/api/account`, {}, {}));
    }

    /**
     * Sends to the backend that we'll use the address with this id as the shipping address
     */
    selectShippingAddress(addressId: number): Observable<HTTPResponse> {
      // console.log('AdresID' + addressId);
        return from(this.http.post(`https://app.kroon.nl/api/shipping/existing-address`, {
            address_id: addressId
        }, {}));
    }


    selectShippingMethod(comment: string): Observable<HTTPResponse> {

        const body = {
            shipping_method: 'free.free',
            comment
        };

        return from(this.http.post(`https://app.kroon.nl/api/shipping/method`, body, {}));
    }


    /**
     * Sends to the backend that we'll use the address with this id as the payment address
     */
    selectPaymentAddress(addressId: number): Observable<HTTPResponse> {

        // console.log({
        //     address_id: addressId
        // });
        return from(this.http.post(`https://app.kroon.nl/api/payment/existing-address`, {
            address_id: addressId
        }, { }));
    }

    /**
     * Creates a new shipping address with the given data.
     */
    addShippingAddress(firstName: string, lastName: string, company: string, firstAddress: string, secondAddress: string, postalCode: string, city: string, zoneId: number): Observable<HTTPResponse> {
        const body = {
            firstname: firstName,
            lastname: lastName,
            company,
            address_1: firstAddress,
            address_2: secondAddress,
            postcode: postalCode,
            city,
            zone_id: zoneId,
            country_id: 150
        };


        return from(this.http.post(`https://app.kroon.nl/api/shipping/address`, body, { }));
    }

    // getPaymentMethods(): Observable<string> {
    //     return this.http.get<string>(`${Constants.apiUrl}/payment/methods`, { headers: this.headers });
    // }

    // setComment(comment: string): Observable<string> {

    //     const body = {
    //         'payment_method': 'free_checkout',
    //         'agree': true,
    //         "comment": comment
    //     };
    //     return this.http.post<string>(`${Constants.apiUrl}/payment/method`, body, { headers: this.headers });
    // }


    handleComment(comment: string): Observable<HTTPResponse> {

        const body = {
            payment_method: 'cod',
            shipping_method: 'free.free',
            agree: true,
            comment
        };

        return from(this.http.post(`https://app.kroon.nl/api/handle/comment`, body, { }));
    }

    confirmOrder(): Observable<HTTPResponse> {
        return from(this.http.post(`https://app.kroon.nl/api/order/simpleconfirmation`, {}, { }));
    }

    placeOrder(): Observable<HTTPResponse> {
        return from(this.http.put(`https://app.kroon.nl/api/order/save`, {}, {  }));
    }

    emptyCart(): Observable<HTTPResponse> {
        return from(this.http.delete(`https://app.kroon.nl/api/cart/empty`, {}, {}));
    }

    addItemsToCart(items: Array<{}>): Observable<HTTPResponse> {
      console.log(JSON.stringify(items) + 'Dit zijn de items die er nu in je winkelwagen staan.')
      console.log('HET HOORT hier langs te gaan');

        return from(this.http.post(`https://app.kroon.nl/api/cart/bulk`, {
            items
        }, { }));
    }

    doSentUnknown(message: {
        subject: string;
        body: string;
        to: Array<string>;
        bcc: Array<string>;
        attachments: Array<{
            path: string;
        }>;
    }): Observable<HTTPResponse> {

        return from(this.http.post(`https://app.kroon.nl/api/order/unknown`, message, { }));
    }

}
