import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivityService } from './shared/activity/activity.service';
import { AuthRepository } from '../app/repositories/auth/auth.repository';
// import { Constants } from './shared/constants';
// import { RouterExtensions } from 'nativescript-angular/router';
import { Storage } from '@ionic/storage-angular';


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
    private storage: Storage
  ) {

  }

  ngOnInit() {
     this.storage.create();

    const isLoggedIn = this.authRepository.isLoggedIn;

    if (isLoggedIn) {
      this.router.navigate(['cart']);
    } else {
      this.router.navigate(['login'],  { replaceUrl: true });
    }
  }

  // MARK - Accessors for view

  get showSpinner(): boolean {
    return this.activityService.isBusy;
  }

}
