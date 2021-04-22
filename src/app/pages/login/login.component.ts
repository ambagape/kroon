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
import { ToastController } from '@ionic/angular';




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
  email: string;
  password: string;


  // public version: string = "0.0.0";

  constructor(
    // private page: Page,
    private router: Router,
    private authRepository: AuthRepository,
    public toastController: ToastController
    // private activityService: ActivityService
  ) {

    // this.page.actionBarHidden = true;


    // appversion.getVersionName().then((v: string) => {
    //   this.version = v;
    // });
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  async ngOnInit() {

    const isLoggedIn = await this.authRepository.isLoggedIn();

    if (isLoggedIn) {
      this.router.navigate(['cart']);
    } else {
      this.router.navigate(['login']);
    }
  }

  async toast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    await toast.present();
  }

  login() {
    const email = this.email;
    const password = this.password;


    console.log(email, password);
    if (email && password) {
      // this.activityService.busy();
      this.authRepository.logIn(email, password).subscribe((res) => {
        // this.activityService.done();
        if (res) {
          this.router.navigate(['cart']);
        } else {
          console.log('-----')
          console.log(res);
          console.log('-------')
          console.log('error');
          this.toast('Check je gegevens');
        }
      });
    } else {
      this.toast('Vul je inloggegevens in');
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
