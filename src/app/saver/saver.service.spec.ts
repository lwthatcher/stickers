import { TestBed, inject } from '@angular/core/testing';

import { SaverService } from './saver.service';

describe('SaverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SaverService]
    });
  });

  it('should be created', inject([SaverService], (service: SaverService) => {
    expect(service).toBeTruthy();
  }));
});
