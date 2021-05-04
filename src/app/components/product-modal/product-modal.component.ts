import {Component, Input, OnInit} from '@angular/core';
import {Product} from "../../shared/product/product.model";
import {ProductResponseStatus} from "../../repositories/product/productresponse.model";
import {CartItem} from "../../shared/product/cartitem.model";
import {ProductRepository} from "../../repositories/product/product.repository";
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit {

  @Input() cartItem: CartItem;

  private currentNumber = 1;
  private quantity = 0;

  // constructor(
  //   private productRepository: ProductRepository,
  //
  // ) {
  // }
  //
  // ngOnInit() {
  //   this.quantity = this.productRepository.getItemQuantity(this.cartItem);
  //
  // }
  //

  //
  // dismiss() {
  //   // using the injected ModalController this page
  //   // can "dismiss" itself and optionally pass back data

  // }
  //
  // addItemToCart() {
  //   if(this.quantity > 0) {
  //     // this.productRepository.addItemToCart(this.cartItem, this.quantity);

  //   }
  //
  // }





  constructor(
    private productRepository: ProductRepository,
      private modalController: ModalController

  ) {
  }

  ngOnInit () {
    this.quantity = this.productRepository.getItemQuantity(this.cartItem);
  }

  // close() {
  //   this.closed.emit();
  // }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true,
    });
  }

  incrementQuantity() {
    this.quantity++;
    this.productRepository.changeItemQuantity(this.cartItem, this.quantity);
    // this.quantity = quantity;
  }

  decrementQuantity() {
    this.quantity--;
    this.productRepository.changeItemQuantity(this.cartItem, this.quantity);
  }

  public addItemToCart() {
    if(this.quantity > 0) {
      // console.log(this.quantity)
      this.productRepository.addItemToCart(this.cartItem, this.quantity);
          this.modalController.dismiss({
            'dismissed': true,
            'data': this.cartItem
          });

      // this.closed.emit();
    }
  }

  // public updateQuantity(quantity: number) {
  //
  // }

  // takePicture() {
  //   if (camera.isAvailable()) {
  //     camera.takePicture({
  //       width: 500,
  //       height: 500,
  //       keepAspectRatio: true,
  //       saveToGallery: true,
  //     })
  //       .then((imageAsset: ImageAsset) => {
  //         this._newImage = imageAsset;
  //         this.addModal = true;
  //       })
  //       .catch((error) => {
  //         console.log('Error while taking a picture', error);
  //       });
  //   }
  // }
  //
  //
  // // MARK - Accessors for view
  //
  // _newImage: ImageAsset;
  //
  // get newImage(): ImageAsset {
  //   return this._newImage;
  // }

}
