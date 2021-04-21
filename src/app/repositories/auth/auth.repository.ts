import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../shared/auth/auth.service';
// import { setString, getString, remove } from 'tns-core-modules/application-settings/application-settings';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable()
export class AuthRepository {

    constructor(
        private authService: AuthService
    ) {

    }

    logIn(email: string, password: string): Observable<boolean> {
        return this.authService.logIn(email, password).pipe(
            map((response: any) => {
                console.log('hier')

                if (response && response.success === true) {

                    Storage.set({ key: 'token', value: response.data.token });
                    Storage.set({ key: 'email', value: email});
                    console.log(Storage.get({key: 'token' }));
                    return of(true);
                } else {
                    return of(false);
                }
            }),
            catchError((response) => {
                console.log("Something went wrong while logging in.", response)
                return of(null);
            })
        )
    }

    logOut() {
        Storage.remove({ key: 'token' });
    }

    // Moet nog worden aangepast
    async isLoggedIn(): Promise<boolean> {
        return (await Storage.get({ key: 'token'})).value !== ('' || null);
    }
}
