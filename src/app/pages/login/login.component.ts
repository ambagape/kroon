import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { AuthRepository } from '../../repositories/auth/auth.repository';
import { ToastController } from '@ionic/angular';
import {HTTP} from '@ionic-native/http/ngx';
import { ActivityService } from 'src/app/shared/activity/activity.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]

})

export class LoginComponent implements OnInit{
  email: string;
  password: string;


  constructor(
    private router: Router,
    private authRepository: AuthRepository,
    public toastController: ToastController,
    private http: HTTP,
    private activityService: ActivityService
  ) {

  }

  async ngOnInit() {

    const isLoggedIn = await this.authRepository.isLoggedIn();

    if (isLoggedIn) {
      await this.router.navigate(['cart']);
    } else {
      await this.router.navigate(['login']);
    }
  }

  async toast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    await toast.present();
  }

  async login() {
    const email = this.email;
    const password = this.password;

    if (email && password) {
      this.activityService.busy();
      await this.authRepository.logIn(email, password).subscribe((res) => {
        this.activityService.done();
        if (res) {
          this.router.navigate(['cart']);
        } else {
          this.toast('Inloggen mislukt');
        }
      });
    } else {
      this.toast('Vul je inloggegevens in');
    }
  }
}
