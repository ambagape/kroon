import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { AuthRepository } from '../../repositories/auth/auth.repository';
// import { Page } from 'tns-core-modules/ui/page/page';
// import * as utilsModule from 'tns-core-modules/utils/utils';
// import { TextField } from 'tns-core-modules/ui/text-field';
// import { ActivityService } from '~/shared/activity/activity.service';
// import { Toasty } from 'nativescript-toasty';
// import * as appversion from "nativescript-appversion";
// import {Validators, FormBuilder, FormGroup } from '@angular/forms';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]

  // moduleId: module.id,
})

export class LoginComponent {
  // private form: FormGroup;
  //
  // public response;
  public email = '';
  public password = '';


  // public version: string = "0.0.0";

  constructor(
    // private page: Page,
    private router: Router,
    private authRepository: AuthRepository,
    // private activityService: ActivityService
  ) {

    // this.page.actionBarHidden = true;
    const isLoggedIn = this.authRepository.isLoggedIn();

    if (isLoggedIn) {
      this.router.navigate(['cart']);
    } else {
      console.log('Niet ingelogd');
      // this.form = this.formBuilder.group({
      //   email: ['', Validators.required],
      //   password: ['', Validators.required],
      // });
    }

    // appversion.getVersionName().then((v: string) => {
    //   this.version = v;
    // });
  }

  login() {
    const email = 'casper.meijerink@beeproger.com';
    const password = 'password';


    console.log(email, password);
    if (email && password) {
      // this.activityService.busy();
      this.authRepository.logIn(email, password).subscribe((res) => {
        console.log(res);
        // this.activityService.done();
        if (res) {
          this.router.navigate(['cart']);
          // this.router.navigate(['cart'], { clearHistory: true });
        } else {
          console.log('error');
          // new Toasty({
          //   text: "Inloggen mislukt.",
          //   ios: {
          //     displayShadow: false
          //   }
          // }).show();
        }
      });
    }
  }

  // forgotPassword() {
  //   utilsModule.openUrl('https://www.kroon.nl/index.php?route=account/forgotten');
  // }

  // helpTapped() {
  //   utilsModule.openUrl('https://www.kroon.nl/scanapp');
  // }

  // focusPassword() {
  //   (<TextField>this.page.getViewById('password')).focus();
  // }

}
