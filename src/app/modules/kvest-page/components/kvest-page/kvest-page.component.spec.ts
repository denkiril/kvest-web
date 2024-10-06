import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KvestPageComponent } from './kvest-page.component';

describe('KvestPageComponent', () => {
  let component: KvestPageComponent;
  let fixture: ComponentFixture<KvestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KvestPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KvestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
