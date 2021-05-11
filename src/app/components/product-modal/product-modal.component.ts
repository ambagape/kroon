import {Component, Input, OnInit} from '@angular/core';
import {Product} from '../../shared/product/product.model';
import {ProductResponseStatus} from '../../repositories/product/productresponse.model';
import {CartItem} from '../../shared/product/cartitem.model';
import {ProductRepository} from '../../repositories/product/product.repository';
import {ModalController} from '@ionic/angular';
import {ActivityService} from "../../shared/activity/activity.service";
import {OrderService} from "../../shared/order/order.service";
import { Plugins, CameraResultType } from '@capacitor/core';
import {Router} from "@angular/router";
import {NativeStorage} from "@ionic-native/native-storage/ngx";

const { Camera } = Plugins;

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit {

  @Input() cartItem: CartItem;

  quantity = 0;
  // private currentNumber = 1;
  imageAsset: any = null;
  base64: string;
  email: string;

  constructor(
    private productRepository: ProductRepository,
      private modalController: ModalController,
      private activityService: ActivityService,
    private orderService: OrderService,
    private router: Router,
    private nativeStorage: NativeStorage
    // private camera: Camera

  ) {
  }

  async ngOnInit() {
    await this.nativeStorage.getItem('email').then(email => {
      this.email = email;
    }).catch(console.log)
    this.quantity = this.productRepository.getItemQuantity(this.cartItem);
  };

  // close() {
  //   this.closed.emit();
  // }

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

  public addItemToCart() {
    if (this.quantity > 0) {
      this.productRepository.addItemToCart(this.cartItem, this.quantity);
          this.modalController.dismiss({
            dismissed: true,
            data: this.cartItem
          });

      // this.closed.emit();
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

    this.activityService.busy();



    const description = '';

    const body = `${ this.email } meldt: Het product met deze code staat niet in de app. ${description != '' ? `<br><br>${description}` : ''}`;

      return this.orderService.doSentUnknown({
        subject: `Onbekend product ( door: ${this.email} )`,
        body: body,
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
            this.modalController.dismiss();
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
