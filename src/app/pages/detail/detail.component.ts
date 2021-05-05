import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CartItem} from '../../shared/product/cartitem.model';
import {Location} from '@angular/common';
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
      // console.log()
      // console.log(params['cartItem'])
      // this.refresh = params["refresh"];
      console.log(JSON.stringify(JSON.parse(params.cartItem).product.attribute_groups));

      // this.currency = JSON.parse(params["currency"]);
    });

    this.quantity = this.cartItem.quantity;

  }

  back() {
    this.router.navigateByUrl('/cart');
    window.location.reload();
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

}
