import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product } from '../../shared/product/product.model';
import { CartItem } from '../../shared/product/cartitem.model';
import { Address } from '../../shared/order/address.model';
import { OrderService } from '../../shared/order/order.service';
import { ProductRepository } from '../product/product.repository';

@Injectable()
export class OrderRepository {

    private _addresses: Array<Address> = null;

    constructor(
        private orderService: OrderService,
        private productRepository: ProductRepository
    ) {

    }

    addresses(): Observable<Array<Address>> {
        if (this._addresses) {
            return of(this._addresses);
        }
        return this.orderService.addresses().pipe(
            map((response: any) => {
                if (response) {
                    if (response.success != 1) {
                        return null;
                    }
                    if (response.data && response.data.addresses) {
                        this._addresses = response.data.addresses;
                        return response.data.addresses;
                    }
                    return null;
                }
            }),
            catchError((err) => {
                console.log("Something went wrong while getting the delivery addresses:", err);
                return of(null);
            })
        )
    }

    selectShippingAddress(addressId: number): Observable<boolean> {
        return this.handleStatus(this.orderService.selectShippingAddress(addressId), 'setting the delivery address');
    }


    selectPaymentAddress(addressId: number): Observable<boolean> {

        if (!addressId) {
            return this.handleStatus(this.orderService.defaultAddress().pipe(map((account: any) => {
                // console.log('account');
                // console.log(account.data.address_id);
                // console.log('account');
                console.log(this.handleStatus(this.orderService.selectPaymentAddress(account.data.address_id), 'settng the payment address'));
                // console.log('account');

                return this.handleStatus(this.orderService.selectPaymentAddress(account.data.address_id), 'settng the payment address');
            })), 'settng the payment address');
        } else {

            console.log('addressId');
            console.log(addressId);
            console.log('addressId');

            return this.handleStatus(this.orderService.selectPaymentAddress(addressId), 'selecting the payment address');
        }

    }

    selectShippingMethod(comment: string): Observable<boolean> {
        return this.handleStatus(this.orderService.selectShippingMethod(`Bestel App order ${comment}`), 'setting the delivery method');
    }

    addShippingAddress(firstName: string, lastName: string, company: string, firstAddress: string, secondAddress: string, postalCode: string, city: string, zoneId: number): Observable<boolean> {
        return this.handleStatus(this.orderService.addShippingAddress(firstName, lastName, company, firstAddress, secondAddress, postalCode, city, zoneId), 'creating a new payment address');
    }

    // It looks like you NEED to call this method before you can set the payment methods.
    // getPaymentMethods(): Observable<boolean> {
    //     return this.handleStatus(this.orderService.getPaymentMethods(), 'getting the payment methods');
    // }

    // setComment(comment: string): Observable<boolean> {
    //     // prefixes 'Bestel App order' to indicate an order is coming from the app.
    //     return this.handleStatus(this.orderService.setComment(`Bestel App order ${comment}`), 'setting the order comment');
    // }

    doHandleComment(comment: string): Observable<boolean> {
        return this.handleStatus(this.orderService.handleComment(`KROON Scanapp order ${comment}`), 'handling comment');
    }
    // handle/comment

    confirmOrder(): Observable<boolean> {
        return this.handleStatus(this.orderService.confirmOrder(), 'confirming order');
    }

    placeOrder(): Observable<boolean> {
        return this.handleStatus(this.orderService.placeOrder(), 'placing order');
    }

    emptyCart(): Observable<boolean> {
        return this.handleStatus(this.orderService.emptyCart(), 'emptying the cart');
    }

    addItemsToCart(): Observable<boolean> {
        if (this.productRepository.cartItems.length == 0 || this.productRepository.hasOfflineProducts) {
            return of(false);
        }
        const items = this.productRepository.cartItems.map((cartItem) => {

            return {
                product_id: cartItem.product.product_id,
                quantity: cartItem.quantity
            }
        });
        return this.handleStatus(this.orderService.addItemsToCart(items), 'adding items to the cart');
    }


    // MARK - Private methods

    private handleStatus(request: Observable<any>, requestDescription: string = '<no request description supplied>'): Observable<boolean> {
        return request.pipe(
            map((response: any) => {
                if (response) {
                    return response.success == 1;
                }
                return false;
            }),
            // catchError((err) => {
            //     console.log(`Something went wrong while ${requestDescription}:`, err);
            //     return of(false);
            // })
        )
    }


}