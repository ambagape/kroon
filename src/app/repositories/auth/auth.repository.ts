import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../shared/auth/auth.service';
// import { setString, getString, remove } from 'tns-core-modules/application-settings/application-settings';
import { Plugins } from '@capacitor/core';

import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Injectable()
export class AuthRepository {
  constructor(
    private authService: AuthService,
    private nativeStorage: NativeStorage
  ) {}

  logIn = (email: string, password: string): Observable<boolean> =>
    this.authService.logIn(email, password).pipe(
      map((response: any) => {
        response = JSON.parse(response.data);
        if (response && response.success === true) {
          this.nativeStorage.setItem('token', response.data.token);
          this.nativeStorage.setItem('email', email).then(console.log);

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
    this.nativeStorage.remove('token');
  }

  // Moet nog worden aangepast
  async isLoggedIn() {
    return this.nativeStorage.getItem('token').then((token) => {
      if (token) {
        return true;
      } else {
        return false;
      }
    });
    // return (await this.nativeStorage.getItem('token')).value !== ('' || null);
    // return aw
  }
}
