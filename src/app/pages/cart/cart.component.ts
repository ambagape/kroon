import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
// import { Page, isAndroid, isIOS, Observable } from 'tns-core-modules/ui/page/page';
// import { connectionType, startMonitoring, stopMonitoring } from "tns-core-modules/connectivity";

import { ActivityService } from '../../shared/activity/activity.service';
import { AuthRepository } from '../../repositories/auth/auth.repository';
// import { BarcodeScanner } from "nativescript-barcodescanner";
import { CartItem } from '../../shared/product/cartitem.model';
import { ProductRepository } from '../../repositories/product/product.repository';
import {Router} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {OrderModalComponent} from '../../components/order-modal/order-modal.component';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
// import '@capacitor-community/http';
import { Plugins } from '@capacitor/core';
import {ProductModalComponent} from '../../components/product-modal/product-modal.component';
import {HTTP} from "@ionic-native/http/ngx";
import {HttpHeaders} from "@angular/common/http";
import {from} from "rxjs";
import {NativeStorage} from "@ionic-native/native-storage/ngx";
// import { RouterExtensions } from 'nativescript-angular/router';
// import { SearchBar } from "tns-core-modules/ui/search-bar";
// import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@ionic-native/network/ngx';



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
  public filterText = '';
  private _cartItems: CartItem[];
  private _scannedCartItem: CartItem;
  private search: string = null;


  productInformation=null;
  barCode: any;
  // private iqKeyboard: IQKeyboardManager;

  constructor(
    // private page: Page,
    private router: Router,
    private productRepository: ProductRepository,
    private authRepository: AuthRepository,
    private activityService: ActivityService,
    public modalController: ModalController,
    public barcodeScanner: BarcodeScanner,
    private http: HTTP,
    private storage: Storage,
    private network: Network

  ) {


    // this.page.actionBarHidden = true;

    // if (isIOS) {
    //   this.iqKeyboard = IQKeyboardManager.sharedManager();
    //   this.iqKeyboard.overrideKeyboardAppearance = true;
    //   this.iqKeyboard.keyboardAppearance = UIKeyboardAppearance.Dark;
    //   this.iqKeyboard.shouldResignOnTouchOutside = true;
    // }
  }

  onSearchChange(args) {
    const filtered = this._cartItems.filter(item => item.product.name.includes(args.target.value))
    this._cartItems = filtered;
  }

 async ngOnInit() {
   // await this.storage.create();


   // this._cartItems = this.productRepository.cartItems;

   // this._cartItems = this.productRepository.cartItems

   this.network.onConnect().subscribe(() => {
     if ((this.network.type === 'wifi' || this.network.type === 'mobile') && this.productRepository.hasOfflineProducts) {
       this.productRepository.updateOfflineProducts();
     }
   });

   // if(cartItems) {
   //   this._cartItems = cartItems;
   // }

   // let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
   //   console.log('network was disconnected :-(');
   // });


    // startMonitoring((type) => {
    //   if ((type === connectionType.mobile || type === connectionType.wifi) && this.productRepository.hasOfflineProducts) {
    //   }


    // });
      // this.productRepository.cartItems.on("change", (result) => {
      //   if (result.action === "add" || "splice") {
      //     this._cartItems = result.object.get('_array');
      //   }
      // });
    // });

    // const headers = new HttpHeaders();
    // headers.append('Content-Type', 'application/json');
    // headers.append('Accept', 'application/json');


    // this.http.get(`https://app.kroon.nl/api/product/ean/X362240`, {},     {}).then(res => {
    //   console.log(JSON.stringify(res.data))
    // });

  }



  ngOnDestroy() {
    // stopMonitoring();
  }

  async openBarCodeScanner() {
    await this.barcodeScanner.scan().then(async res => {
      await this.productRepository.productForEan(res.text).subscribe( async (productResponse) => {
        await this.activityService.busy();
        const cartItem: CartItem = CartItem.for(productResponse.status, productResponse.product, res.text);

        const modal = await this.modalController.create({
          component: ProductModalComponent,
          componentProps: {
            cartItem
          }
        });

        modal.onDidDismiss().then((cartItem: any) => {
          if(cartItem) {
            this._cartItems.push(cartItem.data.data);
            this.storage.set('cartItems', this._cartItems);
            this.activityService.done();
          }
        });

        return await modal.present();
      });

      });
  }

  orderModalClosed() {
    this.showOrderModal = false;
  }

  logOut() {
    this.authRepository.logOut();
    this.router.navigate(['login']);
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

  async presentOrderModal() {
    const modal = await this.modalController.create({
      component: OrderModalComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }
}
