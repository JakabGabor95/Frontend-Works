import { TestBed } from '@angular/core/testing';

import { MapSizeService } from './map-size.service';

describe('MapSizeService', () => {
  let service: MapSizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapSizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
