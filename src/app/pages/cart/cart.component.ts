import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AuthRepository} from "../../repositories/auth/auth.repository";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {

  constructor(
    private router: Router,
    private authRepository: AuthRepository,
  ) { }

  ngOnInit() {

  }

  logOut() {
    this.authRepository.logOut();
    this.router.navigate(['login'],  { replaceUrl: true });
  }

}
