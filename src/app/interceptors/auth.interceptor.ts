import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
// import { RouterExtensions } from "nativescript-angular/router";
// import { getString, remove } from 'tns-core-modules/application-settings/application-settings';
import { Router } from "@angular/router";
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = Storage.get({ key: "token" });
    if (token) {
      console.log("token " + token);
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(catchError((err) => {
      if (err.status === 401) {
        Storage.remove({ key: "token" });
        this.router.navigate(['login']);
      }
      const error = (err.error.error && err.error.error[0]) || err.error.message || err.statusText;
      return throwError(error);
    }));
  }
}