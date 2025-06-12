import { TestBed } from '@angular/core/testing';

import { FireworksService } from './fireworks.service';

describe('FireworksService', () => {
  let service: FireworksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FireworksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
