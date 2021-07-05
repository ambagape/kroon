/* eslint-disable no-underscore-dangle */
import { Component, Pipe } from '@angular/core';
import { ActivityService } from '../../shared/activity/activity.service';
import { AuthRepository } from '../../repositories/auth/auth.repository';
import { CartItem } from '../../shared/product/cartitem.model';
import { ProductRepository } from '../../repositories/product/product.repository';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { OrderModalComponent } from '../../components/order-modal/order-modal.component';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ProductModalComponent } from '../../components/product-modal/product-modal.component';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@ionic-native/network/ngx';
import { OverlayEventDetail } from '@ionic/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {

  showOrderModal = false;
  showSearch = false;
  productInformation = null;
  barCode: any;
  //public modal: HTMLIonModalElement;
  public noSearchResults: boolean;
  public filterText = '';
  public search: string = null;
  public orderButtonDisabled = true;

  private _cartItems: CartItem[] = [];

  constructor(
    private router: Router,
    private _productRepository: ProductRepository,
    private authRepository: AuthRepository,
    private activityService: ActivityService,
    public modalController: ModalController,
    public barcodeScanner: BarcodeScanner,
    private storage: Storage,
    private network: Network,
    public navCtrl: NavController,
    public toastController: ToastController,
  ) {
  }

  async ionViewWillEnter() {
    await this.storage.create();
    let cartItems = await this.storage.get('cartItems');
    this._cartItems = cartItems? cartItems: [];
    this.network.onConnect().subscribe(async () => {
      setTimeout(async () => {
        this._cartItems = await this.productRepository.updateOfflineProducts();
      }, 3000);
    });    
  }

  onSearchChange(args) {
    this.filterText = args.target.value;
  }

  openBarCodeScanner() {
    this.activityService.busy();
    this.barcodeScanner.scan({
      // eslint-disable-next-line max-len
      prompt: 'Plaats een barcode binnen de rechthoek om deze te scannen. Druk op de terug-knop op uw apparaat als u alle producten gescand heeft', // Android
    }).then(async barCodeData => {
      if (!barCodeData.cancelled) {
        this.productRepository.productForEan(barCodeData.text).subscribe(async (productResponse) => {
          console.log(productResponse);
          this.activityService.busy();
          const cartItem: CartItem = CartItem.for(productResponse.status, productResponse.product, barCodeData.text);
          const modal = await this.modalController.create({
            component: ProductModalComponent,
            componentProps: {
              cartItem,
              ean: barCodeData.text
            }
          });
          await modal.present();
          modal.onDidDismiss().then(async (data) => {
            return this.addToCart(data)
          }).then((e) => {
            this.refreshCartAndReopenScanner(e);
          });


        });
      }
      this.activityService.done();
    });
  }

  refreshCartAndReopenScanner(e) {
    this.storage.get('cartItems')
      .then((result) => {
        if (result) {
          this._cartItems = result;
        }
      })
      .finally(() => {
        this.orderButtonDisabled = false;
        if (e) {
          this.openBarCodeScanner();
        }
      });
  }

  async addToCart(data: OverlayEventDetail<any>) {
    console.log(data?.data?.data?.cartItem + 'Hier zou hij moeten komen');
    if (data?.data?.isSend) {
      this.toast('Bericht succesvol verzonden!');
    }
    if (data?.data?.data?.cartItem && data?.data?.data?.quantity) {
      await this.productRepository.addItemToCart(data.data.data.cartItem, data.data.data.quantity);
      return true;
    }
    return false;
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

    if (index > -1) {
      this._cartItems.splice(index, 1);
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
      },
    });

    modal.onDidDismiss()
      .then((data) => {
        if (data?.data?.succeeded) {
          this.storage.get('cartItems').then(res => {
            if (res) {
              this.toast('Bestelling succesvol ontvangen');
              this._cartItems = res;
            }
          });
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

  get productRepository() {
    return this._productRepository;
  }

  async toast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 5000
    });
    await toast.present();
  }
}

