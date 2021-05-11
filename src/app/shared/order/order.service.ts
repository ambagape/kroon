import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
import {HTTP, HTTPResponse} from '@ionic-native/http/ngx';

@Injectable()
export class OrderService {

    constructor(
        private http: HTTP
    ) {
      this.http.setHeader('*', String('Content-Type'), String('application/json'));
      this.http.setHeader('*', String('Accept'), String('application/json'));
      this.http.setDataSerializer('json');

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
        return from(this.http.post(`https://app.kroon.nl/api/shipping/existing-address`, {
          // eslint-disable-next-line @typescript-eslint/naming-convention
            address_id: addressId
        }, {}));
    }


    selectShippingMethod(comment: string): Observable<HTTPResponse> {

        const body = {
          // eslint-disable-next-line @typescript-eslint/naming-convention
            shipping_method: 'free.free',
            comment
        };

        return from(this.http.post(`https://app.kroon.nl/api/shipping/method`, body, {}));
    }


    /**
     * Sends to the backend that we'll use the address with this id as the payment address
     */
    selectPaymentAddress(addressId: number): Observable<HTTPResponse> {
        return from(this.http.post(`https://app.kroon.nl/api/payment/existing-address`, {
          // eslint-disable-next-line @typescript-eslint/naming-convention
            address_id: addressId
        }, { }));
    }

    /**
     * Creates a new shipping address with the given data.
     */
    // eslint-disable-next-line max-len
    addShippingAddress(firstName: string, lastName: string, company: string, firstAddress: string, secondAddress: string, postalCode: string, city: string, zoneId: number): Observable<HTTPResponse> {
        const body = {
            firstname: firstName,
            lastname: lastName,
            company,
          // eslint-disable-next-line @typescript-eslint/naming-convention
            address_1: firstAddress,
          // eslint-disable-next-line @typescript-eslint/naming-convention
            address_2: secondAddress,
            postcode: postalCode,
            city,
          // eslint-disable-next-line @typescript-eslint/naming-convention
            zone_id: zoneId,
          // eslint-disable-next-line @typescript-eslint/naming-convention
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
          // eslint-disable-next-line @typescript-eslint/naming-convention
            payment_method: 'cod',
          // eslint-disable-next-line @typescript-eslint/naming-convention
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

    addItemsToCart(items: Array<any>): Observable<HTTPResponse> {
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
