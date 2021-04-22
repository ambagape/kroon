import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
// import { Page, isAndroid, isIOS, Observable } from 'tns-core-modules/ui/page/page';
// import { connectionType, startMonitoring, stopMonitoring } from "tns-core-modules/connectivity";

import { ActivityService } from '../../shared/activity/activity.service';
import { AuthRepository } from '../../repositories/auth/auth.repository';
// import { BarcodeScanner } from "nativescript-barcodescanner";
import { CartItem } from '../../shared/product/cartitem.model';
import { ProductRepository } from '../../repositories/product/product.repository';
import {Router} from "@angular/router";
import {ModalController} from "@ionic/angular";
import {OrderModalComponent} from "../order-modal/order-modal.component";
// import { RouterExtensions } from 'nativescript-angular/router';
// import { SearchBar } from "tns-core-modules/ui/search-bar";
// import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  // moduleId: module.id,
})
export class CartComponent implements OnDestroy, OnInit {

  showOrderModal = false;
  showSearch = false;
  public noSearchResults: boolean;
  public filterText: string = '';
  private _cartItems: CartItem[];
  // private iqKeyboard: IQKeyboardManager;

  constructor(
    // private page: Page,
    private router: Router,
    private productRepository: ProductRepository,
    private authRepository: AuthRepository,
    private activityService: ActivityService,
    public modalController: ModalController

  ) {
    // this.page.actionBarHidden = true;

    // if (isIOS) {
    //   this.iqKeyboard = IQKeyboardManager.sharedManager();
    //   this.iqKeyboard.overrideKeyboardAppearance = true;
    //   this.iqKeyboard.keyboardAppearance = UIKeyboardAppearance.Dark;
    //   this.iqKeyboard.shouldResignOnTouchOutside = true;
    // }
  }

  ngOnInit() {
    // startMonitoring((type) => {
    //   if ((type === connectionType.mobile || type === connectionType.wifi) && this.productRepository.hasOfflineProducts) {
    //     this.productRepository.updateOfflineProducts();
    //   }

      const i = this._cartItems = this.productRepository.cartItems;
        console.log(i)
      // });
      // this.productRepository.cartItems.on("change", (result) => {
      //   if (result.action === "add" || "splice") {
      //     this._cartItems = result.object.get('_array');
      //   }
      // });
    // });
  }

  ngOnDestroy() {
    // stopMonitoring();
  }

  // order() {
  //   if (this.canOrder) {
  //     this.showOrderModal = true;
  //   }
  // }

  // scan() {
  //   if (isIOS) {
  //     this.router.navigate(['scan'], {
  //       transition: {
  //         name: 'slideTop'
  //       }
  //     });
  //   } else {
  //     this.handleScanning();
  //   }
  // }

  // modalClosed() {
  //   this._scannedCartItem = null;
  //   if (isAndroid) {
  //     this.handleScanning();
  //   }
  // }

  orderModalClosed() {
    this.showOrderModal = false;
  }

  logOut() {
    this.authRepository.logOut();
    this.router.navigate(['login']);
  }

  searchQueryChanged(args) {
  }

  // public onSubmit(args) {
  //   let searchBar = <SearchBar>args.object;
  //   this.filterText = searchBar.text;
  // }
  //
  // public onClear(args) {
  //   let searchBar = <SearchBar>args.object;
  //   searchBar.text = this.filterText = '';
  //   searchBar.hint = "Zoeken in winkelwagen";
  // }

  get cartItems(): CartItem[] {

    return this._cartItems;
  };

  // get isAndroid(): boolean {
  //   return isAndroid;
  // }
  //
  // // This is code that is only used in the Android app.
  // private _scannedCartItem: CartItem;
  //
  // get scannedCartItem(): CartItem {
  //   return this._scannedCartItem;
  // }
  //
  // get canOrder(): boolean {
  //   return this.productRepository.cartItems.length != 0 && !this.productRepository.hasOfflineProducts && !this.productRepository.hasUnexistingProducts;
  // }
  //
  // handleScanning() {
  //   let barcodescanner = new BarcodeScanner();
  //   barcodescanner.scan({
  //     message: 'Scan een product om deze toe te voegen aan uw winkelwagen. Druk op de terug-knop zodra u alle producten heeft gescand',
  //     beepOnScan: true,
  //     showFlipCameraButton: false,
  //     preferFrontCamera: false,
  //     showTorchButton: false,
  //     // closeCallback: () => { console.log("Scanner closed"); }, // invoked when the scanner was closed (success or abort)
  //   })
  //     .then((result) => {
  //       if (result.text) {
  //         this.activityService.busy();
  //         this.productRepository.productForEan(result.text).subscribe((productResponse) => {
  //           this.activityService.done();
  //           const cartItem: CartItem = CartItem.for(productResponse.status, productResponse.product, result.text);
  //           this._scannedCartItem = cartItem;
  //
  //         });
  //       }
  //     }, (error) => {
  //       console.log(error);
  //     });
  // }
  async presentModal() {
    const modal = await this.modalController.create({
      component: OrderModalComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }
}
