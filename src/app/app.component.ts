import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityService } from './shared/activity/activity.service';
import { AuthRepository } from '../app/repositories/auth/auth.repository';
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

 async ngOnInit() {
     await this.storage.create();

    await this.authRepository.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        this.router.navigate(['cart']);
      } else {
        this.router.navigate(['login'],  { replaceUrl: true });
      }
    });

  }

  // MARK - Accessors for view

  get showSpinner(): boolean {
    return this.activityService.isBusy;
  }

}
