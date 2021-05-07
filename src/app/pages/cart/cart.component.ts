/* eslint-disable no-underscore-dangle */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivityService } from '../../shared/activity/activity.service';
import { AuthRepository } from '../../repositories/auth/auth.repository';
import { CartItem } from '../../shared/product/cartitem.model';
import { ProductRepository } from '../../repositories/product/product.repository';
import {NavigationExtras, Router} from '@angular/router';
import {ModalController, NavController} from '@ionic/angular';
import {OrderModalComponent} from '../../components/order-modal/order-modal.component';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import {ProductModalComponent} from '../../components/product-modal/product-modal.component';
import {HTTP} from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@ionic-native/network/ngx';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {

  showOrderModal = false;
  showSearch = false;
  productInformation=null;
  barCode: any;
  public noSearchResults: boolean;
  public filterText = '';
  public search: string = null;
  private _cartItems: CartItem[] = [];

  constructor(
    private router: Router,
    private productRepository: ProductRepository,
    private authRepository: AuthRepository,
    private activityService: ActivityService,
    public modalController: ModalController,
    public barcodeScanner: BarcodeScanner,
    private storage: Storage,
    private network: Network,
    public navCtrl: NavController

  ) {
  }

  onSearchChange(args: { target: { value: string } }) {
    this.filterText = args.target.value;
  }

async ngOnInit() {
    await this.storage.create();

    this.storage.get('cartItems').then(res => {
      if(res) {
        this._cartItems = res;
      }
    });

   this.network.onConnect().subscribe(() => {
     if ((this.network.type === 'wifi' || this.network.type === 'mobile') && this.productRepository.hasOfflineProducts) {
       this.productRepository.updateOfflineProducts();
     }
   });

   this.activityService.done();
  }

  openBarCodeScanner() {
    this.activityService.busy();

    this.barcodeScanner.scan().then(async res => {

      this.productRepository.productForEan(res.text).subscribe(async (productResponse) => {

        this.activityService.busy();
        const cartItem: CartItem = CartItem.for(productResponse.status, productResponse.product, res.text);

        const modal = await this.modalController.create({
          component: ProductModalComponent,
          componentProps: {
            cartItem
          }
        });

        // this.activityService.done();

        return await modal.present();
      });

      });
  }

  orderModalClosed() {
    this.showOrderModal = false;
  };

  logOut() {
    this.authRepository.logOut();
    this.router.navigate(['login']);
  };

  delete = (item: CartItem) => {
    const index = this._cartItems.indexOf(item);

    if (index > -1) {
      this._cartItems.splice(index, 1)
    }
      this.productRepository.removeItemFromCart(item);
  };

  public onInputClear(args: any) {

    this.filterText = '';
  }

  get cartItems(): CartItem[] {

    return this._cartItems;
  };

  async presentOrderModal() {
    const modal = await this.modalController.create({
      component: OrderModalComponent,
      componentProps: {
        cartItems: this.cartItems
      }
    });
    return await modal.present();
  }

  show(item: CartItem) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        cartItem: JSON.stringify(item),
      }
    };

    this.navCtrl.navigateForward(['detail'], navigationExtras);
  }
}
