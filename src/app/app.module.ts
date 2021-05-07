import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PagesModule } from './pages/pages.module';
import { ServicesModule } from './shared/services.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './shared/auth/auth.service';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { BrowserModule } from '@angular/platform-browser';
import {LoginComponent} from './pages/login/login.component';
import { HTTP } from '@ionic-native/http/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import {IonicStorageModule} from '@ionic/storage-angular';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';


@NgModule({
  declarations: [
      AppComponent,
  ],
  imports: [
      AppRoutingModule,
      PagesModule,
      BrowserModule,
      IonicModule.forRoot(),
      IonicStorageModule.forRoot(),
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
    HTTP,
    BarcodeScanner,
    NativeStorage,
    Network,
    Camera

  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})

export class AppModule {

}
