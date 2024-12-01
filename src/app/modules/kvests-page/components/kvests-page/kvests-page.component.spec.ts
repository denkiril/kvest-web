import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KvestsPageComponent } from './kvests-page.component';

describe('KvestsPageComponent', () => {
  let component: KvestsPageComponent;
  let fixture: ComponentFixture<KvestsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KvestsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KvestsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
