import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductRepository } from 'src/app/repositories/product/product.repository';
import { ActivityService } from 'src/app/shared/activity/activity.service';
import { Storage } from '@ionic/storage-angular';

import { CartItem } from 'src/app/shared/product/cartitem.model';
import { ProductService } from 'src/app/shared/product/product.service';
import { ProductResponseStatus } from 'src/app/repositories/product/productresponse.model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


describe('ProductRepository', () => {
  let activityService: jasmine.SpyObj<ActivityService>;
  let productService: jasmine.SpyObj<ProductService>;
  let productRepository: ProductRepository;
  let httpTestingController: HttpTestingController;

  const cartItems: CartItem[] = [
    {ean:'3434',offline:false,exists:true,quantity:3,product:{id:1,ean:'3434','model':'',product_id:1,image:'', name:'','jan':'', description:'', meta_description:'',meta_title:'', attribute_groups:[]}},
    {ean:'3435',offline:false,exists:true,quantity:3,product:{id:1,ean:'3435','model':'',product_id:1,image:'', name:'','jan':'', description:'', meta_description:'',meta_title:'', attribute_groups:[]}}
  ];
  
  beforeEach(waitForAsync(() => {  
    let store = {cartItems:[]};
        
    const mockLocalStorage = {           
        create: () => {
            return {
                get: (key: string): any => {
                    return key in store ? JSON.parse(store[key]) : null;
                },
                set: (key: string, value: any) : Promise<any> => {
                    store[key] = `${JSON.stringify(value)}`;   
                    return Promise.resolve();             
                } 
            }
        } ,
        get: (key: string): any => {
            return key in store ? JSON.parse(store[key]) : null;
        },
        set: (key: string, value: any) : Promise<any> => {
            store[key] = `${JSON.stringify(value)}`;   
            return Promise.resolve();             
        }                    
    };           
    activityService = jasmine.createSpyObj('ActivityService',['busy','done']);
    productService = jasmine.createSpyObj('ProductService',['productForEan']);    
  
    TestBed.configureTestingModule({        
        imports: [HttpClientTestingModule],
        providers: [ 
          {provide: Storage, useValue: mockLocalStorage},
          { provide: ActivityService, useValue: activityService},
          { provide: ProductService, useValue: productService},
          ProductRepository,        
        ]
    });
    productRepository = TestBed.inject(ProductRepository);
  }));

  it('should create', () => {
    expect(productRepository).toBeTruthy();
  });
 
  it('should always get a dummy cartItem with mage when network is down',  async ()=>{
    productRepository.productForEan(cartItems[0].ean)
    .subscribe(product=> {
        expect(product.ean).toBe(cartItems[0].ean);
        expect(product.status).toBe(ProductResponseStatus.Offline);
        expect(product.product.image).toBe("assets/connection.png");           
    }); 
    
    const req = httpTestingController.expectOne("http://wwewe.com");    
    // Connection timeout, DNS error, offline, etc
    const mockError = new ErrorEvent('Network error', {
        message: "Offline",
    });
    req.error(mockError);
  });

  it('should always get an item when network is ok',  async ()=>{
    productService.productForEan.and.returnValue(of({"data":'{"data": ['+JSON.stringify(cartItems[0].product)+'],"success": 1}',"status":2,"headers":{},"url":""}));
    productRepository.productForEan(cartItems[0].ean)
    .subscribe(product=> {
        expect(product.status).toEqual( ProductResponseStatus.Success);
    });        
  });

  it('should add dummy/offiline item to cart', async ()=>{ 
    let offlineProd = {
        offline:true,
        exists:true,
        quantity:3,
        product: {
            id: null, 
            product_id: null, 
            ean: null, 
            name: null,
            model: null, 
            jan: null, 
            description: null, 
            meta_title: null,
            meta_description: null,
            attribute_groups: null,
            image: "assets/connection.png"
        },
        ean: "4444"
      }   
    productRepository.addItemToCart(offlineProd, 3);
    expect(productRepository.getItemQuantity(offlineProd)).toBe(3);                
  });

  it('should add online item to cart', async ()=>{
    productRepository.addItemToCart(cartItems[0], 2);
    expect(productRepository.getItemQuantity(CartItem[0])).toBe(2);  
  });

  it('should update offline item when netwwork is restored', async ()=>{
    productRepository.addItemToCart(cartItems[0], 2);
    expect(productRepository.getItemQuantity(CartItem[0])).toBe(2);  
  });  
  
});
