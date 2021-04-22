import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { PagesModule } from './pages/pages.module';
// import { ComponentsModule } from './components/components.module';
import { ServicesModule } from './shared/services.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './shared/auth/auth.service';
// import { BarcodeScanner } from 'nativescript-barcodescanner';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { BrowserModule } from '@angular/platform-browser';
import {LoginComponent} from "./pages/login/login.component";




@NgModule({
  declarations: [
      AppComponent,
  ],
  imports: [
      AppRoutingModule,
      PagesModule,
      BrowserModule,
      IonicModule.forRoot(),
      // ComponentsModule,
      ServicesModule,
      RepositoriesModule
  ],
  entryComponents: [
    LoginComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthService,
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})

export class AppModule {

}
