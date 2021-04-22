import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivityService } from './shared/activity/activity.service';
import { AuthRepository } from '../app/repositories/auth/auth.repository';
// import { Constants } from './shared/constants';
// import { RouterExtensions } from 'nativescript-angular/router';

@Component({
  // moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {

  constructor(
    private authRepository: AuthRepository,
    private router: Router,
    private activityService: ActivityService
  ) {

  }

  async ngOnInit() {
    const isLoggedIn = await this.authRepository.isLoggedIn();

    if (isLoggedIn) {
      await this.router.navigate(['cart']);
    } else {
      await this.router.navigate(['login'],  { replaceUrl: true });
    }
  }

  // MARK - Accessors for view

  get showSpinner(): boolean {
    return this.activityService.isBusy;
  }

}
