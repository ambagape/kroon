import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CartItem} from '../../shared/product/cartitem.model';
import {ProductRepository} from '../../repositories/product/product.repository';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {

  cartItem: CartItem = null;
  quantity;

  constructor(private route: ActivatedRoute, private router: Router, private productRepository: ProductRepository) {

  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.cartItem = JSON.parse(params.cartItem);
    });

    this.quantity = this.cartItem.quantity;
  }

  back() {
    window.location.href = '/cart';
  }

  incrementQuantity() {
    this.quantity++;
    this.productRepository.changeItemQuantity(this.cartItem, this.quantity);
  }

  decrementQuantity() {
    this.quantity--;
    this.productRepository.changeItemQuantity(this.cartItem, this.quantity);
  }
}
