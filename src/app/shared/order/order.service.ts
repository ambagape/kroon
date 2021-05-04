import { HttpClient, HttpHeaders } from '@angular/common/http';

// import { Constants } from '../constants';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';
import {HTTP, HTTPResponse} from '@ionic-native/http/ngx';


@Injectable()
export class OrderService {

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
     * Creates the request to retrieve the delivery addresses.
     */
    addresses(): Observable<string> {
        return this.http.get<string>(`https://app.kroon.nl/api/shipping/addresses`, { headers: this.headers });
    }

    /**
     * Creates the request to retrieve the delivery addresses.
     */
    paymentAddresses(): Observable<string> {
        return this.http.get<string>(`https://app.kroon.nl/api/payment/addresses`, { headers: this.headers });
    }

    /**
     * Creates the request to retrieve the delivery addresses.
     */
    defaultAddress(): Observable<string> {
        return this.http.get<string>(`https://app.kroon.nl/api/account`, { headers: this.headers });
    }

    /**
     * Sends to the backend that we'll use the address with this id as the shipping address
     */
    selectShippingAddress(addressId: number): Observable<string> {
        return this.http.post<string>(`https://app.kroon.nl/api/shipping/existing-address`, {
            address_id: addressId
        }, { headers: this.headers });
    }


    selectShippingMethod(comment: string): Observable<string> {

        const body = {
            'shipping_method': 'free.free',
            "comment": comment
        };

        return this.http.post<string>(`https://app.kroon.nl/api/shipping/method`, body, { headers: this.headers });
    }


    /**
     * Sends to the backend that we'll use the address with this id as the payment address
     */
    selectPaymentAddress(addressId: number): Observable<string> {

        // console.log({
        //     address_id: addressId
        // });
        return this.http.post<string>(`https://app.kroon.nl/api/payment/existing-address`, {
            address_id: addressId
        }, { headers: this.headers });
    }

    /**
     * Creates a new shipping address with the given data.
     */
    addShippingAddress(firstName: string, lastName: string, company: string, firstAddress: string, secondAddress: string, postalCode: string, city: string, zoneId: number): Observable<string> {
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


        return this.http.post<string>(`https://app.kroon.nl/api/shipping/address`, body, { headers: this.headers });
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


    handleComment(comment: string): Observable<string> {

        const body = {
            'payment_method': 'cod',
            'shipping_method': 'free.free',
            'agree': true,
            "comment": comment
        };

        return this.http.post<string>(`https://app.kroon.nl/api/handle/comment`, body, { headers: this.headers });
    }

    confirmOrder(): Observable<string> {
        return this.http.post<string>(`https://app.kroon.nl/api/order/simpleconfirmation`, {}, { headers: this.headers });
    }

    placeOrder(): Observable<string> {
        return this.http.put<string>(`https://app.kroon.nl/api/order/save`, {}, { headers: this.headers });
    }

    emptyCart(): Observable<string> {
        return this.http.delete<string>(`https://app.kroon.nl/api/cart/empty`, { headers: this.headers });
    }

    addItemsToCart(items: Array<{}>): Observable<string> {

        return this.http.post<string>(`https://app.kroon.nl/api/cart/bulk`, {
            items
        }, { headers: this.headers });
    }

    doSentUnknown(message: {
        subject: string,
        body: string,
        to: Array<string>,
        bcc: Array<string>,
        attachments: Array<{
            path: string,
        }>
    }): Observable<string> {

        return this.http.post<string>(`https://app.kroon.nl/api/order/unknown`, message, { headers: this.headers });
    }

}
