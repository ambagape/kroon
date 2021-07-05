/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Observable, forkJoin, of } from 'rxjs';
import { ProductResponse, ProductResponseStatus } from './productresponse.model';
import { catchError, map } from 'rxjs/operators';
import { ActivityService } from '../../shared/activity/activity.service';
import { CartItem } from '../../shared/product/cartitem.model';
import { Injectable, OnInit } from '@angular/core';
import { Product } from '../../shared/product/product.model';
import { ProductService } from '../../shared/product/product.service';
import { Storage } from '@ionic/storage-angular';
@Injectable()
export class ProductRepository {

  private _cartItems: CartItem[] = [];

  constructor(
    private productService: ProductService,
    private activityService: ActivityService,
    private storage: Storage) {
    this.readCartFromDisk();
  }

  productForEan(ean: string): Observable<ProductResponse> {
    return this.productService.productForEan(ean).pipe(
      map((response: any) => {
        response = JSON.parse(response.data);
        if (response && response.data) {
          if (response.success !== 1) {
            return {
              status: ProductResponseStatus.Error,
              product: null,
              ean
            };
          }
          if (response.data.length === 1) {
            const product: Product = response.data[0];
            return {
              status: ProductResponseStatus.Success,
              product,
              ean
            };
          }
          return {
            status: ProductResponseStatus.Error,
            product: null,
            ean
          };
        }
      }),
      catchError((response) => {
        console.log('Something went wrong while getting the product.' + response.message);
        return of({
          status: ProductResponseStatus.Offline,
          product: {
            id: null,
            product_id: null,
            ean: ean,
            name: "Offline product",
            model: ean,
            jan:"Onbekend",
            description: null,
            meta_title: null,
            meta_description: null,
            attribute_groups: null,
            image: "assets/connection.png"
          },
          ean
        });
      })
    );
  }

  // MARK - Cart methods

  get cartItems(): CartItem[] {

    return this._cartItems;
  }

  /**
   * Returns the item with the given id from the cart.
   */
  private findItemInCart(id: number): CartItem {

    const filtered = this.cartItems.filter((cartItem) => cartItem.product && id === cartItem.product.id);
    if (filtered.length) {
      return filtered[0];
    }
    return undefined;
  }


  /**
   * Checks if an iten with the given id is in the shopping cart.
   */
  isItemInCart(id: number): boolean {
    const a = this.findItemInCart(id);
    return a != null;
  }


  isItemInCartByEan(ean: string): boolean {
    const filtered = this.cartItems.filter((cartItem) => ean === cartItem.ean);
    if (filtered.length) {
      return !!filtered[0];
    }
    return null;
  }

  indexOfItemInCartByEan(ean: string): number {
    const filtered = this.cartItems.filter((cartItem) => ean === cartItem.ean);
    if (filtered.length) {
      const ix = this._cartItems.indexOf(filtered[0]);
      return ix === -1 ? null : ix;
    }
    return null;
  }

  addItemToCart(item: CartItem, quantity: number = null) {
    if (!quantity) {
      quantity = this.getItemQuantity(item);
    }

    // If the product exists
    if (item.product) {

      // If it's in the cart, increase quantity by 1.
      if (this.isItemInCart(item.product.id)) {

        const i = this.indexOfItemInCartByEan(item.ean);
        const old = this._cartItems[i];
        this._cartItems[i] = { ...old, quantity };

      } else {

        this._cartItems.push({ ...item, quantity });

      }
    } else {
      // If the product doesn't exist or is offline and isn't in the cart yet, add it.
      if (!this.isItemInCartByEan(item.ean)) {
        this._cartItems.push({ ...item, quantity });
      } else {
        // If the product is in the cart, add quantity to it even if we're currently offline.
        const i = this.indexOfItemInCartByEan(item.ean);
        if (item.offline && i) {

          const old = this._cartItems[i];

          this._cartItems[i] = { ...old, quantity };
        }
      }
    }
    // Send request to write the cart to disk.
    this.writeCartToDisk();

    // alert ("sdsdsdas");
    // window.location.reload();

  }

  removeItemFromCart(item: CartItem) {
    const i = this.indexOfItemInCartByEan(item.ean);

    if (i !== null) {
      this._cartItems.splice(i, 1);
      this.writeCartToDisk();
    }

  }

  emptyCart() {
    this._cartItems.splice(0);
    this.writeCartToDisk();
  }

  getItemQuantity(item: CartItem): number {
    const i = this.indexOfItemInCartByEan(item.ean);
    const foundItem = this._cartItems[i];
    if (foundItem && foundItem.quantity) {

      return foundItem.quantity;
    }
    return 1;
  }

  changeItemQuantity(item: CartItem, quantity: number) {

    if (item.product) {
      const i = this.indexOfItemInCartByEan(item.ean);

      if (!(i === null || undefined)) {

        const old = this._cartItems[i];

        if (old.quantity !== quantity) {
          this._cartItems[i] = { ...old, quantity };
          this.writeCartToDisk();
        }
      }
    }
  }

  /**
   * Checks if the cart contains offline items.
   */
  get hasOfflineProducts(): boolean {

    this.storage.get('cartItems').then(response => {
      if (response) {
        this._cartItems = response;
      }
    }).then(() => {
      const filtered = this._cartItems.filter((e) => e.offline);
      console.log(JSON.stringify(filtered) + 'Gefilterd')

      if (filtered.length) {
        console.log(filtered[0] + 'Hallo')
        return filtered[0] !== undefined;
      }
    })

    console.log('Hier komt hij')


    return false;
  }

  get hasUnexistingProducts(): boolean {

    const filtered = this._cartItems.filter((e) => !e.exists);

    if (filtered.length) {
      return filtered[0] !== undefined;
    }

    return false;
  }

  /**
   * Updates the products that are offline by getting their data from the server.
   * TODO: Think of a way to handle multiple unexisting products being updated here. How do we handle that in terms of UI?
    * Loop over all the items? And for each item, you do an API request. But on the other hand you will get an lot of requests.
   */
  async updateOfflineProducts() {
    const cartItems = await this.readCartFromDisk();
    const requests = [];
    cartItems.forEach((item) => {
      console.log(JSON.stringify(item) + ' result loop')
      if (!item.offline || !item.ean) {
        return;
      }
      requests.push(this.productForEan(item.ean));
    });
    this.activityService.busy();
    requests.forEach((productResponse) => {      
      if (!productResponse) {
        return;
      }
      if (productResponse.status === 'success' && productResponse.product) {
        const i = this.indexOfItemInCartByEan(productResponse.ean);
        if (i !== null || undefined) {
          cartItems[i] = CartItem.for(productResponse.status, productResponse.product, productResponse.ean);
        }
      } else if (productResponse.status === 'error') {
        const i = this.indexOfItemInCartByEan(productResponse.ean);
        if (i !== null || undefined) {
          cartItems[i] = CartItem.for(productResponse.status, productResponse.product, productResponse.ean);
        }
      }
    });
    this.activityService.done();
    this.writeCartToDisk();
    return this._cartItems;    
  }

  private writeCartToDisk() {
    this.storage.set('cartItems', this._cartItems);
  }

  async readCartFromDisk() {
    this._cartItems = await this.storage.get('cartItems');
    return this._cartItems;
  }
}
