import { HttpInterceptor, HttpRequest } from '@angular/common/http/';
import {HttpEvent, HttpHandler} from '@angular/common/http';
// import { AuthProvider } from "../providers/auth/auth";
import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage-angular";
import {Observable} from "rxjs";
// import {Storage} from "@ionic/storage/ngc";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  val: string;

  constructor(public _storage: Storage) {
    _storage.get('token').then((val) => {
      console.log('De value' + val)
      this.val = val;
    });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const changedReq = req.clone({headers: req.headers.set('Authorization', 'Bearer ' + this.val)});

    return next.handle(changedReq);
  }

}
