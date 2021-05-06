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
  private _scannedCartItem: CartItem;

  constructor(
    private router: Router,
    private productRepository: ProductRepository,
    private authRepository: AuthRepository,
    private activityService: ActivityService,
    public modalController: ModalController,
    public barcodeScanner: BarcodeScanner,
    private http: HTTP,
    private storage: Storage,
    private network: Network,
    public navCtrl: NavController

  ) {
  }

  onSearchChange(args) {
    const filtered = this._cartItems.filter(item => item.product.name.includes(args.target.value));
    this._cartItems = filtered;
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

  }

  async openBarCodeScanner() {
    await this.barcodeScanner.scan().then(async res => {
      this.productRepository.productForEan(res.text).subscribe(async (productResponse) => {
        await this.activityService.busy();
        const cartItem: CartItem = CartItem.for(productResponse.status, productResponse.product, res.text);
        await this.activityService.done();


        const modal = await this.modalController.create({
          component: ProductModalComponent,
          componentProps: {
            cartItem
          }
        });

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

  delete = (i: CartItem) => {
      this.productRepository.removeItemFromCart(i);
  };

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

  async presentOrderModal() {
    const modal = await this.modalController.create({
      component: OrderModalComponent,
      componentProps: {
        cartItems: this.cartItems
      }
    });
    return await modal.present();
  }

  show(id) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        cartItem: JSON.stringify(this._cartItems[id]),
      }
    };

    this.navCtrl.navigateForward(['detail'], navigationExtras);
  }
}
