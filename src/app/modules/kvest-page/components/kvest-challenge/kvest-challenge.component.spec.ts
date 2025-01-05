import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KvestChallengeComponent } from './kvest-challenge.component';

describe('KvestChallengeComponent', () => {
  let component: KvestChallengeComponent;
  let fixture: ComponentFixture<KvestChallengeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KvestChallengeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KvestChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
