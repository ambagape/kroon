import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { HomePageComponent } from "./home__________/home.component";
// import { ComponentsModule } from "~/components/components.module";
import { LoginComponent } from './login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartComponent } from './cart/cart.component';
import {IonicModule} from '@ionic/angular';
import {ComponentModule} from '../components/component.module';
import { DetailComponent } from './detail/detail.component';
// import { ScanPageComponent } from "./scanner/scanner.component";
// import { DetailPageComponent } from "./detail/detail.component";

@NgModule({
    schemas: [ NO_ERRORS_SCHEMA ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentModule
    // ComponentsModule,
  ],
    declarations: [
        // HomePageComponent,
        LoginComponent,
        CartComponent,
        // ScanPageComponent,
        DetailComponent
    ],

})

export class PagesModule { }
