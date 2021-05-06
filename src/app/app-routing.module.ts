import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import {CartComponent} from './pages/cart/cart.component';
import {DetailComponent} from './pages/detail/detail.component';

const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cart', component: CartComponent  },
  { path: 'detail', component: DetailComponent }
  // { path: 'refresh', component: CartComponent  },

// { path: 'scan', component: ScanPageComponent },
  // { path: 'detail', component: DetailPageComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
