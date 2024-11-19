import { TestBed } from '@angular/core/testing';

import { KvestPageService } from './kvest-page.service';

describe('KvestPageService', () => {
  let service: KvestPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KvestPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
