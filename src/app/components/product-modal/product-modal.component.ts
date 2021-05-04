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
  private quantity = 1;

  constructor(
    private productRepository: ProductRepository,
    private modalController: ModalController

  ) {
  }

  ngOnInit() {
    this.quantity = this.productRepository.getItemQuantity(this.cartItem);

  }

  incrementQuantity() {
    this.cartItem.quantity++;
  }

  decrementQuantity() {
    this.cartItem.quantity--;
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true,
    });
  }

  addItemToCart() {
    if(this.quantity > 0) {
      // this.productRepository.addItemToCart(this.cartItem, this.quantity);
      this.modalController.dismiss({
        'dismissed': true,
        'data': this.cartItem
      });
    }

  }

}
