// import { File, Folder, knownFolders } from 'tns-core-modules/file-system';
import { Observable, forkJoin, of } from 'rxjs';
import {Plugins, FilesystemDirectory, FilesystemEncoding, FileReadResult} from '@capacitor/core';
const { Filesystem } = Plugins;

import { ProductResponse, ProductResponseStatus } from './productresponse.model';
import { catchError, map } from 'rxjs/operators';

import { ActivityService } from '../../shared/activity/activity.service';
import { CartItem } from '../../shared/product/cartitem.model';
import {Injectable, OnInit} from '@angular/core';
import { Product } from '../../shared/product/product.model';
import { ProductService } from '../../shared/product/product.service';
import { Storage } from '@ionic/storage-angular';


@Injectable()
export class ProductRepository implements OnInit{

  private _cartItems: CartItem[] = [];

  constructor(
    private productService: ProductService,
    private activityService: ActivityService,
    private storage: Storage
  ) {


    this.readCartFromDisk();
  }

  async ngOnInit() {
    await this.storage.create();

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
        console.log("Something went wrong while getting the product." + response.message)
        return of({
          status: ProductResponseStatus.Offline,
          product: null,
          ean
        });
      })
    )
  }

  // MARK - Cart methods

  get cartItems(): CartItem[] {
    return this._cartItems;
  }

  /**
   * Returns the item with the given id from the cart.
   */
  private findItemInCart(id: number): CartItem {

    const filtered = this.cartItems.filter((cartItem) => {
      return cartItem.product && id == cartItem.product.id;
    });
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
    const filtered = this.cartItems.filter((cartItem) => {
      return ean == cartItem.ean;
    });
    if (filtered.length) {
      return !!filtered[0];
    }
    return null;
  }

  indexOfItemInCartByEan(ean: string): number {
    const filtered = this.cartItems.filter((cartItem) => {
      return ean == cartItem.ean;
    });
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
        this._cartItems[i] = { ...old, quantity: quantity };

      } else {

        this._cartItems.push({ ...item, quantity: quantity });

      }
    } else {
      // If the product doesn't exist or is offline and isn't in the cart yet, add it.
      if (!this.isItemInCartByEan(item.ean)) {
        this._cartItems.push({ ...item, quantity: quantity });
      } else {
        // If the product is in the cart, add quantity to it even if we're currently offline.
        const i = this.indexOfItemInCartByEan(item.ean);
        if (item.offline && i) {

          const old = this._cartItems[i];

          this._cartItems[i] =  { ...old, quantity: quantity };
        }
      }
    }
    // Send request to write the cart to disk.
    // this.writeCarrtToDisk();

  }

  removeItemFromCart(item: CartItem) {

    const i = this.indexOfItemInCartByEan(item.ean);

    if (i !== null) {
      this._cartItems.splice(i, 1);
      // this.writeCartToDisk();

    }
  }

  emptyCart() {
    this._cartItems.splice(0);
    // this.writeCartToDisk();
  }

  getItemQuantity(item: CartItem): number {
    const i = this.indexOfItemInCartByEan(item.ean);
    let foundItem = this._cartItems[i];
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

        if (old.quantity != quantity) {
          this._cartItems[i] = { ...old, quantity: quantity };
          // this.writeCartToDisk();
        }
      }
    }
  }

  /**
   * Checks if the cart contains offline items.
   */
  get hasOfflineProducts(): boolean {

    const filtered = this._cartItems.filter((e) => {

      return e.offline;
    });

    if (filtered.length) {

      return filtered[0] != undefined;
    }

    return false;
  }

  get hasUnexistingProducts(): boolean {

    const filtered = this._cartItems.filter((e) => {

      return !e.exists;
    });

    if (filtered.length) {
      return filtered[0] != undefined;
    }

    return false;
  }

  /**
   * Updates the products that are offline by getting their data from the server.
   * TODO: Think of a way to handle multiple unexisting products being updated here. How do we handle that in terms of UI?
   */
  updateOfflineProducts() {

    const requests = [];

    this._cartItems.forEach((item) => {

      if (!item.offline || !item.ean) {
        return;
      }
      requests.push(this.productForEan(item.ean));
    });

    this.activityService.busy();

    forkJoin(requests).subscribe((results: Array<ProductResponse>) => {

      results.forEach((productResponse) => {

        if (!productResponse) {

          return;
        }

        if (productResponse.status === 'success' && productResponse.product) {

          const i = this.indexOfItemInCartByEan(productResponse.ean);

          if (i !== null || undefined) {
            this._cartItems[i] = CartItem.for(productResponse.status, productResponse.product, productResponse.ean);
          }
        } else if (productResponse.status === 'error') {

          const i = this.indexOfItemInCartByEan(productResponse.ean);

          if (i !== null || undefined) {

            this._cartItems[i] = CartItem.for(productResponse.status, productResponse.product, productResponse.ean);
          }
        }
      })

      this.activityService.done();
      // this.writeCartToDisk();

    });
  }

  // private get cartFile(): Promise<FileReadResult> {

    //  return Filesystem.readFile({
    //   path: 'cartItems/cart-items.json',
    //   directory: FilesystemDirectory.Documents,
    //   encoding: FilesystemEncoding.UTF8
    // });
    // const documents: FilesystemDirectory = knownFolders.documents();
    // const folder: Folder = documents.getFolder('cartItems');




    // return folder.getFile('cart-items.json');
  // }
  //
  // private writeCartToDisk() {
  //   const file = this.cartFile;
  //   file.writeFile()
  //   file.writeText(JSON.stringify(this._cartItems.map(ci => ci))).then((d) => {
  //     console.log('Successfully wrote cart to disk.');
  //   }).catch((err) => {
  //     console.log('Error writing cart to disk:', err);
  //   })
  // }

  private async readCartFromDisk() {

   await this.storage.get('cartItems').then(response => {
      if(response) {
        console.log(JSON.stringify(response))
        this._cartItems = response;
        console.log('Succesfully readed')
      } else {
        return;
      }
    }).catch(error => {
      console.log('Something went wrong')
   });
    // const file = this.cartFile;
    // file.readText()
    //   .then((res) => {
    //     if (res) {
    //       this._cartItems = JSON.parse(res);
    //       console.log('Successfully read cart from disk.');
    //     }
    //   })
    //   .catch((err) => {
    //     console.log('Error while reading cart items from disk:', err);
    //   })
  }
}
