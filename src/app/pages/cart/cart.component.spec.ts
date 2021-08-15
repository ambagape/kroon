/* eslint-disable @typescript-eslint/naming-convention */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Network } from '@ionic-native/network/ngx';
import { IonicModule, ModalController, NavController, ToastController } from '@ionic/angular';
import { of } from 'rxjs';
import { AuthRepository } from 'src/app/repositories/auth/auth.repository';
import { ProductRepository } from 'src/app/repositories/product/product.repository';
import { ActivityService } from 'src/app/shared/activity/activity.service';
import { Storage } from '@ionic/storage-angular';

import { CartComponent } from './cart.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe } from '@angular/core';
import { CartItem } from 'src/app/shared/product/cartitem.model';
import { ProductService } from 'src/app/shared/product/product.service';
import { ProductResponseStatus } from 'src/app/repositories/product/productresponse.model';
import { ProductModalComponent } from 'src/app/components/product-modal/product-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let networkSpy: jasmine.SpyObj<Network>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;
  let toastElementSpy: jasmine.SpyObj<HTMLIonToastElement>;
  let modalElementSpy: jasmine.SpyObj<HTMLIonModalElement>;
  let storageSpy: jasmine.SpyObj<Storage>;
  let barcodeScannerSpy: jasmine.SpyObj<BarcodeScanner>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let activityService: jasmine.SpyObj<ActivityService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let authRepository: jasmine.SpyObj<AuthRepository>;
  let productService: jasmine.SpyObj<ProductService>;

  const cartItems: CartItem[] = [
    { ean: '3434', offline: false, exists: true, quantity: 3,
      product: { id: 1,
        ean: '3434',
        model: '',
        product_id: 1,
        image: '',
        name: '',
        jan: '',
        description: '',
        meta_description: '',
        meta_title: '',
        attribute_groups: []
      }
    },
    { ean: '3435', offline: false, exists: true, quantity: 3,
      product: { id: 1,
        ean: '3435',
        model: '',
        product_id: 1,
        image: '',
        name: '',
        jan: '',
        description: '',
        meta_description: '',
        meta_title: '',
        attribute_groups: []
      }
    }
  ];

  beforeEach(waitForAsync(() => {
    networkSpy = jasmine.createSpyObj('Network', ['onConnect', 'type']);
    networkSpy.onConnect.and.returnValue(of([{}]));
    networkSpy.type = 'mobile';
    toastElementSpy = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create', 'dismiss']);
    toastCtrlSpy.create.and.returnValue(new Promise((resolve, reject) => {
      resolve(jasmine.createSpyObj(toastElementSpy));
    }));
    storageSpy = jasmine.createSpyObj('Storage', ['create', 'get', 'set']);
    storageSpy.create.and.returnValue(
      new Promise((resolve, reject) => resolve(jasmine.createSpyObj('Storage', ['create'])))
    );
    storageSpy.get.and.returnValue(new Promise((resolve, reject) => resolve(cartItems)));
    barcodeScannerSpy = jasmine.createSpyObj('BarcodeScanner', ['scan']);
    barcodeScannerSpy.scan.and.returnValue(
      new Promise((resolve, reject) => {
        resolve({ text: '3434', format: 'EAN_8', cancelled: false });
      }));
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    modalElementSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalController = jasmine.createSpyObj('ModalController', ['create']);
    modalController.create.and.returnValue(new Promise((resolve, reject) => {
      resolve(jasmine.createSpyObj(modalElementSpy));
    }));
    activityService = jasmine.createSpyObj('ActivityService', ['busy', 'done']);
    authRepository = jasmine.createSpyObj('AuthRepository', ['login']);
    productService = jasmine.createSpyObj('ProductService', ['productForEan']);

    TestBed.configureTestingModule({
      declarations: [CartComponent],
      imports: [RouterTestingModule, IonicModule.forRoot(), CommonModule],
      providers: [
        { provide: Storage, useValue: storageSpy },
        { provide: Network, useValue: networkSpy },
        { provide: ToastController, useValue: toastCtrlSpy },
        { provide: BarcodeScanner, useValue: barcodeScannerSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: ModalController, useValue: modalController },
        { provide: ActivityService, useValue: activityService },
        { provide: AuthRepository, useValue: authRepository },
        { provide: ProductService, useValue: productService },
        ProductRepository,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load storage', async () => {
    await component.ionViewWillEnter();
    expect(component.cartItems).toBe(cartItems);
  });

  it('should scan and retrieve item', async () => {
    productService.productForEan
      .and.returnValue(of({ data: '{"data": [' + JSON.stringify(cartItems[0].product) + '],"success": 1}',
        status: 2,
        headers: {},
        url: ''
      }));
    const cartItem = CartItem.for(ProductResponseStatus.Success, cartItems[0].product, cartItems[0].ean);
    component.openBarCodeScanner();
    expect(modalController.create).toHaveBeenCalledWith({
      component: ProductModalComponent,
      componentProps: {
        cartItem,
        ean: cartItem.ean
      }
    });
  });

  it('should add to cart', async () => {
    const cartItem = CartItem.for(ProductResponseStatus.Success, cartItems[0].product, cartItems[0].ean);
    expect(await component.addToCart({ data: { data: { cartItem, quantity: 2 } } })).toBeTrue();
  });

  it('should display cartItems appropriately', async () => {
    const cartItemList = [
      CartItem.for(ProductResponseStatus.Success, cartItems[0].product, cartItems[0].ean),
      CartItem.for(ProductResponseStatus.Offline,
        { id: 3466,
          ean: '3466',
          model: '3466',
          product_id: 3466,
          image: '',
          name: '',
          jan: '',
          description: '',
          meta_description: '',
          meta_title: '',
          attribute_groups: []
        }, '3466'),
      CartItem.for(ProductResponseStatus.Offline,
        { id: 3456,
          ean: '3456',
          model: '3456',
          product_id: 3466,
          image: '',
          name: '',
          jan: '',
          description: '',
          meta_description: '',
          meta_title: '',
          attribute_groups: []
        }, '3456')
    ];
    storageSpy.get.and.returnValue(new Promise((resolve, reject) => resolve(cartItemList)));

    await component.update();
    fixture.detectChanges();
    const ionItems = fixture.nativeElement.querySelectorAll('ion-item-sliding');
    expect(ionItems.length).toBe(3);

  });

});


