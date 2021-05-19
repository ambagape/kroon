/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
import { Component, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ProductRepository } from '../../repositories/product/product.repository';
import { OrderRepository } from '../../repositories/order/order.repository';
import { Address } from '../../shared/order/address.model';
// import { Page, isIOS } from 'tns-core-modules/ui/page/page';
// import { setNumber, getNumber, remove } from 'tns-core-modules/application-settings/application-settings';
import { forkJoin } from 'rxjs';
import { ActivityService } from '../../shared/activity/activity.service';
import {Router} from '@angular/router';
import {ModalController, ToastController} from '@ionic/angular';
// import { Toasty } from 'nativescript-toasty';
// import { PickerComponent } from '../picker/picker.component';
// import { TextField } from 'tns-core-modules/ui/text-field/text-field';

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
  selectedAddress: Address | any = null;
  selectedString = 'Selecteer optie';

  selectedProvince = 'Drenthe';
  ordernumber: string;

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

  constructor(
    // private page: Page,
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private cdRef: ChangeDetectorRef,
    private activityService: ActivityService,
    private router: Router,
    private modalController: ModalController,
    private toastController: ToastController
  ) {

    this.orderRepository.addresses().subscribe((res) => {
      if (res) {
        this._pickerItems = res;
      }
    });
  }

  close() {
    this.closed.emit();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  order() {
    if (!this.selectedAddress) {

      if (this.canSubmitForm) {
        this.submitForm();
      }
      return;
    }

    this.activityService.busy();

    this.orderRepository.emptyCart().subscribe((emptySuccess) => {
        if (!emptySuccess) {
          // TODO: Handle error.
          this.logError('Fout met leegmaken van de winkelwagen - opencard (OC002)');
          this.activityService.done();
          return;
        };

        this.orderRepository.addItemsToCart().subscribe((addSuccess) => {
          if (!addSuccess) {
            // TODO: Handle error.
            this.logError('Fout met wegschrijven - opencard (OC003)');
            this.activityService.done();
            return;
          };

          const addressRequests = [
            this.orderRepository.selectPaymentAddress(
              parseInt(this.selectedAddress)
            ),
            this.orderRepository.selectShippingAddress(
              parseInt(this.selectedAddress)
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

  addressSelected(index: number) {
    this.changeForIndex(index);
  }

  provinceSelected(index: number) {
    this.selectedProvince = this.provincePickerStrings[index];
  }

  /**
   * Performs all the necessary changes when the address picker index is changed.
   */
  changeForIndex(index) {
    this.index = index;
    const pickerItem = this.pickerItems[this.index];
    if (pickerItem.address_1) {
      this.selectedAddress = pickerItem;
      this.selectedString = pickerItem.company + ', ' + pickerItem.address_1 + ', ' + pickerItem.city;

      // Persist the selected address.
      // const addressId = Number(this.selectedAddress.address_id);
      // if (addressId) {
      //   setNumber('delivery-address-id', addressId);
      // }
    } else {
      this.selectedString = pickerItem;
      this.selectedAddress = null;
      // Remove the selected address.
      // remove('delivery-address-id');
    }
    // Uncomment this line to enable expanding a form to add a new delivery address.
    // this.expanded = this.index === 1;
    this.cdRef.detectChanges();
  }

  zoneIdLookup(province: string): number {
    const i = this.provincePickerStrings.indexOf(province);
    const lookup = [2329, 2330, 2331, 2332, 2333, 2334, 2335, 2336, 2337, 2338, 2339, 2340];
    return lookup[i];
  }

  get showSpinner(): boolean {
    return this.activityService.isBusy;
  }

  /**
   * Performs the request to add a new shipping address.
   */
  submitForm() {

    const firstName = this.adress.firstName;
    const lastName = this.adress.lastName;
    const company = this.adress.company;
    const street = this.adress.street;
    const postalCode = this.adress.postalCode;
    const city = this.adress.city;
    const zoneId = this.zoneIdLookup(this.selectedProvince);

    this.activityService.busy();

    this.orderRepository.emptyCart().subscribe((emptySuccess) => {
      if (!emptySuccess) {
        // TODO: Handle error.
        this.activityService.done();
        return;
      }

      this.orderRepository.addItemsToCart().subscribe((addSuccess) => {
        if (!addSuccess) {
          // TODO: Handle error.
          this.activityService.done();
          return;
        }

        const addressRequests = [
          this.orderRepository.selectPaymentAddress(null),
          this.orderRepository.addShippingAddress(firstName, lastName, company, street, '', postalCode, city, zoneId)
        ];

        forkJoin(addressRequests).subscribe((success: Array<boolean>) => {
          if (!success) {
            this.activityService.done();
            return;
          }
          this.setComment();
            // this.router.navigate(['cart']);

        }, (err) => {
          this.activityService.done();
          this.logError('opencard (006)' + JSON.parse(err.error).error[0]);
        });
      }, (err) => {
        this.activityService.done();
        this.logError('opencard (007)' + JSON.parse(err.error).error[0]);
      });
    }, (err) => {
      this.activityService.done();
      this.logError('opencard (008)' + JSON.parse(err.error).error[0]);
    });
  }

  private setComment() {

    const comment = 'Test';

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

      this.orderRepository.placeOrder().subscribe((orderSuccess) => {
        this.activityService.done();
        if (!orderSuccess) {
          this.toast('Er is iets fout gegaan met ordering' + !orderSuccess);
          // TODO: Handle error.
          return;
        }

        this.productRepository.emptyCart();

        this.modalController.dismiss({
          dismissed: true,
        });



        // new Toasty({
        //   text: "Bestelling geslaagd!",
        //   ios: {
        //     displayShadow: false
        //   }
        // }).show();
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
    // console.log(error);
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

  get pickerItems(): Array<any> {
    const array = Array<any>();
    // Uncomment this line to enable expanding a form to add a new delivery address.
    // array.push('Leg hier een afwijkend adres vast');
    array.push.apply(array, this._pickerItems);
    return array;
  }

  // We need to perform this mutation because the picker can't deal with objects.
  get pickerStrings(): Array<string> {
    return this.pickerItems.map((obj) =>

      // address_id: number;
      // firstname: string;
      // lastname: string;
      // address_1: string;
      // address_2: string;
      // company: string;
      // postcode: string;
      // city: string;

       (typeof obj === 'string')?obj:obj.company + ', ' + obj.address_1 + ', ' + obj.city
    );
  }

  get provincePickerStrings(): Array<string> {
    return [
      'Drenthe',
      'Flevoland',
      'Friesland',
      'Gelderland',
      'Groningen',
      'Limburg',
      'Noord-Brabant',
      'Noord-Holland',
      'Overijssel',
      'Utrecht',
      'Zeeland',
      'Zuid-Holland'
    ];
  }

}
