import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductModalComponent } from './product-modal.component';

describe('ProductModalComponent', () => {
  let fixture: ComponentFixture<ProductModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductModalComponent);
    fixture.detectChanges();
  }));

});
