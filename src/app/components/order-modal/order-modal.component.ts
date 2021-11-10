/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ProductRepository } from '../../repositories/product/product.repository';
import { OrderRepository } from '../../repositories/order/order.repository';
import { Address } from '../../shared/order/address.model';
import { forkJoin } from 'rxjs';
import { ActivityService } from '../../shared/activity/activity.service';
import {ModalController, ToastController} from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  // moduleId: module.id,
  // selector: 'OrderModal',
  templateUrl: 'order-modal.component.html',
  styleUrls: ['order-modal.component.scss']
})
export class OrderModalComponent {

  @Output() closed = new EventEmitter();

  expanded = false;

  index = 0;
  selectedAddress: Address = null;
  selectedString = 'Selecteer optie';

  selectedProvince = 'Drenthe';

  adress = {
    firstName: undefined,
    lastName: undefined,
    company: undefined,
    street: undefined,
    postalCode: undefined,
    city: undefined,
    zoneId: undefined,
  };

  private _pickerItems: Array<Address>;
  private _ordernumber = '';

  constructor(
    // private page: Page,
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private activityService: ActivityService,
    private nativeStorage: NativeStorage,
    private modalController: ModalController,
    private toastController: ToastController
  ) {

    this._ordernumber = null;

    this.orderRepository.addresses().subscribe((res) => {
      if (res) {
        this._pickerItems = res;
      }
    });

    this.nativeStorage.getItem('myitem')
    .then(
      (res) => {
        this.selectedAddress = res;
      },
      error => console.error('Error storing item', error)
    );
  }

  close() {
    this.closed.emit();
  }

  compareWith(o1: Address, o2: Address): boolean {

    // this.nativeStorage?.keys();
    // console.log(this.selectedAddress);

    // console.log(a);

    return o1 && o2 ? o1.address_id === o2.address_id  : o1 === o2;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  order() {

      this.nativeStorage.setItem('myitem', this.selectedAddress)
      .then(
        () => console.log('Stored item!'),
        error => console.error('Error storing item', error)
      );

    this.activityService.busy();

    this.orderRepository.emptyCart().subscribe(async (emptySuccess) => {
        if (!emptySuccess) {
          // TODO: Handle error.
          this.logError('Fout met leegmaken van de winkelwagen - opencard (OC002)');
          this.activityService.done();
          return;
        };

        (await this.orderRepository.addItemsToCart()).subscribe((addSuccess) => {
          if (!addSuccess) {
            // TODO: Handle error.
            this.logError('Fout met wegschrijven - opencard (OC003)');
            this.activityService.done();
            return;
          };

          const addressRequests = [
            this.orderRepository.selectPaymentAddress(
              this.selectedAddress.address_id
            ),
            this.orderRepository.selectShippingAddress(
              this.selectedAddress.address_id
            )
          ];

          forkJoin(addressRequests).subscribe((success: Array<boolean>) => {

            const succeeded = success.every((e) => e);
            if (!succeeded) {
              // TODO: Handle error.
              this.logError('Fout met ophalen adres - opencard (OC004)');
              this.activityService.done();
              return;
            }

            this.setComment();
          }, (err) => {
            this.activityService.done();
            this.logError('opencard (005)' + JSON.parse(err.error).error[0]);
          });
        });
    });
  }

  get showSpinner(): boolean {
    return this.activityService.isBusy;
  }

  get ordernumber(): string {
    return this._ordernumber;
  }

  set ordernumber(ordernumber: string) {
    this._ordernumber = ordernumber;
  }

  private setComment() {

    alert(this.ordernumber);
    const comment = this.ordernumber;
    alert(this.ordernumber);

    this.orderRepository.doHandleComment(comment).subscribe((commentSuccess) => {
      if (!commentSuccess) {
        // TODO: Handle error.
        this.toast('Er is iets fout gegaan met comment' + !commentSuccess);
        this.activityService.done();
        return;
      }
      this.confirmAndPlaceOrder();
    }, (err) => {
      this.activityService.done();
      this.logError('opencard (009)' + JSON.parse(err.error).error[0]);
    });
  }

  private confirmAndPlaceOrder() {
    this.orderRepository.confirmOrder().subscribe((confirmSuccess) => {
      if (!confirmSuccess) {
        this.toast('Er is iets fout gegaan met confirmatie' + !confirmSuccess);
        // TODO: Handle error.
        this.activityService.done();
        return;
      }

      this.orderRepository.placeOrder().subscribe(async (orderSuccess) => {
        this.activityService.done();
        if (!orderSuccess) {
          this.toast('Er is iets fout gegaan met ordering' + !orderSuccess);
          // TODO: Handle error.
          return;
        }

        await this.productRepository.emptyCart();

        this.modalController.dismiss({
          succeeded: true,
        });

        this.activityService.done();
      }, (err) => {
        this.activityService.done();
        this.logError('opencard (010)' + JSON.parse(err.error).error[0]);
      });
    }, (err) => {
      this.activityService.done();
      this.logError('opencard (011)' + JSON.parse(err.error).error[0]);
    });
  }

  private logError(error) {
    this.toast('Error ' + (typeof error === 'object')?JSON.stringify(error):error);
  }

  get canSubmitForm(): boolean {

    let not_completed = true;

    if (this.expanded) {

      not_completed = [
        this.adress.firstName === (null || undefined),
        this.adress.lastName === (null || undefined),
        this.adress.company === (null || undefined),
        this.adress.street === (null || undefined),
        this.adress.postalCode === (null || undefined),
        this.adress.city === (null || undefined),
      ].some( field => field);
    };


    return this.expanded && !not_completed;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async toast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    await toast.present();
  }

  get buttonActive(): boolean {
    return (this.selectedAddress != null || this.canSubmitForm) && !this.activityService.isBusy;
  }

  get pickerItems(): Address[] {

    return this._pickerItems;
  }

}
