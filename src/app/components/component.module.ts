import { NgModule } from "@angular/core";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {ProductModalComponent} from "./product-modal/product-modal.component";
import {OrderModalComponent} from "./order-modal/order-modal.component";
import {FormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  declarations: [
    ProductModalComponent,
    OrderModalComponent
  ],
  exports: [
    ProductModalComponent,
    OrderModalComponent
  ]

})

export class ComponentModule { }
