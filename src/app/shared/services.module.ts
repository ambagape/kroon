import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AuthService } from "./auth/auth.service";
import { ProductService } from "./product/product.service";
import { OrderService } from "./order/order.service";
import { ActivityService } from "./activity/activity.service";
// import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";

@NgModule({
  imports: [
    // HttpClientModule,
    // NativeScriptHttpClientModule
  ],
  providers: [
    AuthService,
    ProductService,
    OrderService,
    ActivityService
  ]
})

export class ServicesModule { }
