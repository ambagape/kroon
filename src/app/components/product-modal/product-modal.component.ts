import {Component, Input, OnInit} from '@angular/core';
import {CartItem} from '../../shared/product/cartitem.model';
import {ProductRepository} from '../../repositories/product/product.repository';
import {ModalController, ToastController} from '@ionic/angular';
import {ActivityService} from '../../shared/activity/activity.service';
import {OrderService} from '../../shared/order/order.service';
import { Plugins, CameraResultType } from '@capacitor/core';
import {NativeStorage} from '@ionic-native/native-storage/ngx';

// eslint-disable-next-line @typescript-eslint/naming-convention
const { Camera } = Plugins;

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit {

  @Input() cartItem: CartItem;
  @Input() ean: any;

  quantity = 1;
  // private currentNumber = 1;
  imageAsset: any = null;
  base64: string;
  email: string;

  constructor(
    private productRepository: ProductRepository,
    private modalController: ModalController,
    private activityService: ActivityService,
    private orderService: OrderService,
    private nativeStorage: NativeStorage,
    private toastController: ToastController
    // private camera: Camera

  ) {
  }

  async ngOnInit() {
    await this.nativeStorage.getItem('email').then(email => {
      this.email = email;
    }).catch(console.log);
    this.quantity = await this.productRepository.getItemQuantity(this.cartItem);
  };

  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
    });
    this.activityService.done();
  };

  incrementQuantity() {
    this.quantity++;
    this.productRepository.changeItemQuantity(this.cartItem, this.quantity);
    // this.quantity = quantity;
  };

  decrementQuantity() {
    this.quantity--;
    this.productRepository.changeItemQuantity(this.cartItem, this.quantity);
  };

  async addItemToCart() {

    if (this.cartItem.offline || this.quantity > 0 && this.quantity <= this.cartItem.product.quantity) {
      console.log(this.cartItem);
      this.modalController.dismiss({
        dismissed: true,
        data: {
          cartItem: this.cartItem,
          quantity: this.quantity
        }
      });
      console.log(this.cartItem, this.quantity);

    }else{
      const toast = await this.toastController.create({message: 'Invalid qauntity', duration: 3000});
      toast.present();
    }
  };

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Base64
    });
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    const imageUrl = image.base64String;

    // Can be set to the src of an image now
    this.base64 = imageUrl;
    this.imageAsset = 'data:image/png;base64,'+ imageUrl;
  }

  send() {
    if (!this.imageAsset) {
      return;
    }

    this.composeEmail();
  }



  private composeEmail() {




    const description = '';

    // eslint-disable-next-line eqeqeq,max-len
    const body = `${ this.email } meldt: Het product met de code: ${this.ean}. Staat niet in de app. ${description != '' ? `<br><br>${description}` : ''}`;

      return this.orderService.doSentUnknown({
        subject: `Onbekend product ( door: ${this.email} )`,
        body,
        to: ['webshop@kroon.nl'],
        bcc: [ this.email ],
        attachments: [{
          path: `${this.base64}`,
        }]
      }).subscribe((response: any) => {
          if (response) {
            // new Toasty({
            //   text: "Bericht verstuurd!!",
            //   ios: {
            //     displayShadow: false
            //   }
            // }).show();

            this.activityService.done();
            this.modalController.dismiss({
              isSend: true
            });
          }
          // new Toasty({
          //   text: "Bericht versturen mislukt. Neem contact op!",
          //   ios: {
          //     displayShadow: false
          //   }
          // }).show();
          this.activityService.done();
          return false;
        },
        err => {
          // new Toasty({
          //   text: `Bericht versturen mislukt. Neem contact op! ${err}`,
          //   ios: {
          //     displayShadow: false
          //   }
          // }).show();
          this.activityService.done();
          return false;
        }
      );
      // catchError((err) => {
      //   new Toasty({
      //     text: "Bericht versturen mislukt. Neem contact op!",
      //     ios: {
      //       displayShadow: false
      //     }
      //   }).show();
      //   return of(false);
      // })
    // })
  }


}
