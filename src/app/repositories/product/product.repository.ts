/* eslint-disable @typescript-eslint/naming-convention */
import { Observable, forkJoin, of } from 'rxjs';
import { ProductResponse, ProductResponseStatus } from './productresponse.model';
import { catchError, map } from 'rxjs/operators';
import { CartItem } from '../../shared/product/cartitem.model';
import { Injectable } from '@angular/core';
import { Product } from '../../shared/product/product.model';
import { ProductService } from '../../shared/product/product.service';
import { Storage } from '@ionic/storage-angular';

@Injectable()
export class ProductRepository {

  constructor(
    private productService: ProductService,
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
          if (response.data.length > 0) {

            // alert(JSON.stringify(response.data));

            const product: Product = response.data[0]; //.find( (x: { ean: string })=>x.ean === ean);
            return {
              status: ProductResponseStatus.Success,
              product,
              ean
            };
          }
          return {
            status: ProductResponseStatus.Error,
            product: {
              id: Math.floor(Math.random() * 100000),
              product_id: Math.floor(Math.random() * 100000),
              ean,
              name: 'Dit product staat niet in onze database',
              model: ean,
              jan: 'Niet op voorraad',
              description: null,
              meta_title: null,
              meta_description: null,
              attribute_groups: null,
              image: 'assets/question-mark.png',
              quantity: 2
            },
            ean
          };
        }
      }),
      catchError((response) => {
        console.log('Something went wrong while getting the product.' + response.message);
        return of({
          status: ProductResponseStatus.Offline,
          product: {
            id: Math.floor(Math.random() * 100000),
            product_id: Math.floor(Math.random() * 100000),
            ean,
            name: 'Geen connectie. Als de connectie hersteld is wordt er opnieuw gezocht',
            model: ean,
            jan: 'Onbekend',
            description: null,
            meta_title: null,
            meta_description: null,
            attribute_groups: null,
            image: 'assets/connection.png',
            quantity: 0
          },
          ean
        });
      })
    );
  }


  /**
   * Checks if an iten with the given id is in the shopping cart.
   */
  async isItemInCart(id: number): Promise<boolean> {
    const a = await this.findItemInCart(id);
    return a != null;
  }


  async isItemInCartByEan(ean: string): Promise<boolean> {
    const filtered = (await this.readCartFromDisk()).filter((cartItem: { ean: string }) => ean === cartItem.ean);
    if (filtered.length) {
      return !!filtered[0];
    }
    return null;
  }

  async indexOfItemInCartByEan(ean: string): Promise<number> {
    const cartItems: CartItem[] = await this.readCartFromDisk();
    const filtered = cartItems.filter((cartItem) => ean === cartItem.ean);
    if (filtered.length) {
      const ix = cartItems.indexOf(filtered[0]);
      return ix === -1 ? null : ix;
    }
    return null;
  }

  async addItemToCart(item: CartItem, quantity: number = null) {
    const cartItems = await this.readCartFromDisk();
    if (!quantity) {
      quantity = await this.getItemQuantity(item);
    }

    // If the product exists
    if (item.product) {

      // If it's in the cart, increase quantity by 1.
      if (await this.isItemInCart(item.product.id)) {

        const i = await this.indexOfItemInCartByEan(item.ean);
        const old = cartItems[i];
        cartItems[i] = { ...old, quantity };

      } else {

        cartItems.push({ ...item, quantity });

      }
    } else {
      // If the product doesn't exist or is offline and isn't in the cart yet, add it.
      if (!await this.isItemInCartByEan(item.ean)) {
        cartItems.push({ ...item, quantity });
      } else {
        // If the product is in the cart, add quantity to it even if we're currently offline.
        const i = await this.indexOfItemInCartByEan(item.ean);
        if (item.offline && i) {

          const old = cartItems[i];

          cartItems[i] = { ...old, quantity };
        }
      }
    }
    // Send request to write the cart to disk.
    await this.writeCartToDisk(cartItems);

    // alert ("sdsdsdas");
    // window.location.reload();

  }

  async removeItemFromCart(item: CartItem) {
    const cartItems = await this.readCartFromDisk();
    const i = await this.indexOfItemInCartByEan(item.ean);
    if (i !== null) {
      cartItems.splice(i, 1);
      await this.writeCartToDisk(cartItems);
    }

  }

  async emptyCart() {
    const cartItems = await this.readCartFromDisk();
    cartItems.splice(0);
    await this.writeCartToDisk(cartItems);
  }

  async getItemQuantity(item: CartItem): Promise<number> {
    const cartItems = await this.readCartFromDisk();
    const i = await this.indexOfItemInCartByEan(item.ean);
    const foundItem = cartItems[i];
    if (foundItem && foundItem.quantity) {

      return foundItem.quantity;
    }
    return 1;
  }

  async changeItemQuantity(item: CartItem, quantity: number) {
    const cartItems = await this.readCartFromDisk();
    if (item.product) {
      const i = await this.indexOfItemInCartByEan(item.ean);
      if (!(i === null || undefined)) {
        const old = cartItems[i];
        if (old.quantity !== quantity) {
          cartItems[i] = { ...old, quantity };
          await this.writeCartToDisk(cartItems);
        }
      }
    }
  }

  /**
   * Checks if the cart contains offline items.
   */
  async hasOfflineProducts(): Promise<boolean> {
    const cartItems: CartItem[] = await this.readCartFromDisk();
    const filtered = cartItems.filter((e) => e.offline);
    if (filtered.length) {
      return filtered[0] !== undefined;
    }
    return false;
  }

  async hasUnexistingProducts(): Promise<boolean> {
    const cartItems = await this.readCartFromDisk();
    const filtered = cartItems.filter((e: { exists: any }) => !e.exists);
    if (filtered.length) {
      return filtered[0] !== undefined;
    }
    return false;
  }

  async updateOfflineProducts(): Promise<CartItem[]> {
    const cartItems: CartItem[] = await this.readCartFromDisk();
    const requests = [];
    cartItems.forEach((item) => {
      if (!item.offline || !item.ean) {
        return;
      }
      requests.push(this.productForEan(item.ean));
    });
    const results: Array<ProductResponse> = await forkJoin<ProductResponse>(requests).toPromise();
    for (const productResponse of results) {
      if (!productResponse) {
        return;
      }
      if (productResponse.status === 'success' && productResponse.product) {
        const i = await this.indexOfItemInCartByEan(productResponse.ean);
        if (i !== null || undefined) {
          cartItems[i] = CartItem.for(productResponse.status, productResponse.product, productResponse.ean);
        }
      } else if (productResponse.status === 'error') {
        const i = await this.indexOfItemInCartByEan(productResponse.ean);
        if (i !== null || undefined) {
          cartItems[i] = CartItem.for(productResponse.status, productResponse.product, productResponse.ean);
        }
      }
    }
    await this.writeCartToDisk(cartItems);
    return cartItems;
  }

  async readCartFromDisk() {
    const cartItems = await this.storage.get('cartItems');
    return cartItems ? cartItems : [];
  }

  private productResponseShowsNonExistence(productResponse: ProductResponse): boolean {
    return productResponse.status === 'error' && productResponse.product == null;
  }

  private async writeCartToDisk(cartItems: CartItem[]) {
    await this.storage.set('cartItems', cartItems);
  }

  /**
   * Returns the item with the given id from the cart.
   */
  private async findItemInCart(id: number): Promise<CartItem> {
    const cartItems = await this.readCartFromDisk();
    const filtered = cartItems.filter((cartItem: { product: { id: number } }) => cartItem.product && id === cartItem.product.id);
    if (filtered.length) {
      return filtered[0];
    }
    return undefined;
  }
}
