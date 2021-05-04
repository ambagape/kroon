import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {CartItem} from "../../shared/product/cartitem.model";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {

  private cartItem: CartItem;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.cartItem = JSON.parse(params['cartItem']);
      // console.log()
      // console.log(params['cartItem'])
      // this.refresh = params["refresh"];
      // this.currency = JSON.parse(params["currency"]);
    });

  }

}
