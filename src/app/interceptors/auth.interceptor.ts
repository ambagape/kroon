import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import {Router} from "@angular/router";
// import {NativeStorage} from "@ionic-native/native-storage/ngx";
// import { RouterExtensions } from "nativescript-angular/router";
// import { getString, remove } from 'tns-core-modules/application-settings/application-settings';
// import { Plugins } from '@capacitor/core';
//
// const { Storage } = Plugins;
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import {getTokenAtPosition} from "@angular/compiler-cli/src/ngtsc/util/src/typescript";


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private nativeStorage: NativeStorage
    ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const token = Storage.get({ key: 'token'}).then(response => {
    //
    // })

    this.nativeStorage.getItem('token').then(token => {
      console.log('Token halen uit NativeStorage' + typeof token)
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    });


    return next.handle(request).pipe(catchError((err) => {
      if (err.status === 401) {
        this.nativeStorage.remove('token').then(() => {
          this.router.navigate(['login']);
        });
      }
      const error = (err.error.error && err.error.error[0]) || err.error.message || err.statusText;
      return throwError(error);
    }));
  }
}
