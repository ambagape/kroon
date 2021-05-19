/* eslint-disable no-underscore-dangle */
import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import { ActivityService } from '../../shared/activity/activity.service';
import { AuthRepository } from '../../repositories/auth/auth.repository';
import { CartItem } from '../../shared/product/cartitem.model';
import { ProductRepository } from '../../repositories/product/product.repository';
import {NavigationExtras, Router} from '@angular/router';
import {ModalController, NavController, ToastController} from '@ionic/angular';
import {OrderModalComponent} from '../../components/order-modal/order-modal.component';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import {ProductModalComponent} from '../../components/product-modal/product-modal.component';
import {HTTP} from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@ionic-native/network/ngx';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
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
  public orderButtonDisabled: boolean = true;

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
    public navCtrl: NavController,
    private nativeStorage: NativeStorage,
    public toastController: ToastController,


  ) {
  }

  ngOnInit() {
    if(this._cartItems) {
      console.log('Hallo')
      this.orderButtonDisabled = true;
    }
  }

  onSearchChange(args) {
    this.filterText = args.target.value;
  }

 async ionViewWillEnter() {
    await this.storage.create();

    await this.storage.get('cartItems').then(res => {
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

      if (!res.cancelled) this.productRepository.productForEan(res.text).subscribe(async (productResponse) => {

        this.activityService.busy();
        const cartItem: CartItem = CartItem.for(productResponse.status, productResponse.product, res.text);

        const modal = await this.modalController.create({
          component: ProductModalComponent,
          componentProps: {
            cartItem,
            ean: res.text
          }
        });

        if(!res.cancelled) {
          await modal.present();
        }

        if(res.cancelled) {
          this.activityService.done();
        }

        await modal.onDidDismiss().then( (data) => {


          if (data?.data?.data?.cartItem && data?.data?.data?.quantity){

            this.productRepository.addItemToCart(data.data.data.cartItem, data.data.data.quantity);
            return true;
          } else {
            this.toast('Bericht succesvol verzonden!')
          }
          return false;
        }).then( (e) => {

          this.storage.get('cartItems')
          .then(res => {
            if(res) {
              this._cartItems = res;
            }
          })
          .finally( () => {
            this.orderButtonDisabled = false;
            if (e) {

              this.openBarCodeScanner();
            }

          });

        });
      });
      this.activityService.done();
    });
  }

  orderModalClosed() {
    this.showOrderModal = false;
  };

  async logOut() {
    await this.authRepository.logOut();
    await this.router.navigate(['login']);
  };

  delete = async (item: CartItem) => {
    const index = this._cartItems.indexOf(item);
    console.log('De index' + index)

    if (index > -1) {
      new Promise((resolve, reject) => {
        this._cartItems.splice(index, 1);
        this.productRepository.removeItemFromCart(item);
      }).finally(async () => {
        await this.storage.get('cartItems').then(res => {
          if(res) {
            this._cartItems = res;

          }
        })
      })



    }

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

  async toast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    await toast.present();
  }
}
