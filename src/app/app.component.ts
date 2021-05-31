import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityService } from './shared/activity/activity.service';
import { AuthRepository } from '../app/repositories/auth/auth.repository';
import { Storage } from '@ionic/storage-angular';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {HTTP} from '@ionic-native/http/ngx';

@Component({
  // moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private authRepository: AuthRepository,
    private router: Router,
    private activityService: ActivityService,
    // private storage: Storage,
    private nativeStorage: NativeStorage,
    private http: HTTP
  ) {

  }

 async ngOnInit() {
    //  await this.storage.create();

   const isLoggedIn = await this.authRepository.isLoggedIn();

   if (isLoggedIn) {
     await this.nativeStorage.getItem('token').then(token => {
       this.http.setHeader('*', String('Authorization'), String('Bearer ' + token));
     });

     await this.router.navigate(['cart']);
   } else {
     await this.router.navigate(['login']);
   }

  }

  get showSpinner(): boolean {
    return this.activityService.isBusy;
  }

}
