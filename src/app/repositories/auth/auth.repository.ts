import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../shared/auth/auth.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import {HTTP} from '@ionic-native/http/ngx';

@Injectable()
export class AuthRepository {
  constructor(
    private authService: AuthService,
    private nativeStorage: NativeStorage,
    private http: HTTP
  ) {}

  logIn = (email: string, password: string): Observable<boolean> =>
    this.authService.logIn(email, password).pipe(
      map((response: any) => {
        response = JSON.parse(response.data);
        if (response && response.success === true) {

          this.nativeStorage.setItem('token', response.data.token).then(() => {
            this.http.setHeader('*', String('Authorization'), String('Bearer ' + response.data.token));
          });
          this.nativeStorage.setItem('email', email);

          return of(true);
        } else {
          return of(false);
        }
      }),
      catchError((response) => {
        console.log('Something went wrong while logging in.', response);
        return of(null);
      })
    );

  logOut() {
    return this.nativeStorage.remove('token');
  }

  // Moet nog worden aangepast
  async isLoggedIn() {
    return this.nativeStorage.getItem('token').then((token) => !!token);
  }
}
