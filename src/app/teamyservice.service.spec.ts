import { TestBed } from '@angular/core/testing';

import { TeamyserviceService } from './teamyservice.service';

describe('TeamyserviceService', () => {
  let service: TeamyserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamyserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
