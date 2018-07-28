// Http testing module and mocking controller
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { SaverService } from './saver.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

describe('SaverService', () => {
  // #region [Variables]
  let httpClient: HttpClient;
  let controller: HttpTestingController;
  const mock_info = { workspace: 'mock.example', name: 'video1', flashes: [3.25] }
  const mock_response = { success: true, msg: "good job!", flashes: [3.25], datum: {} }
  let expectedResponse = (res) => { expect(res).toEqual(mock_response) };
  // #endregion

  // #region [Setup]
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SaverService]
    });
  });

  beforeEach(() => {
    httpClient = TestBed.get(HttpClient);
    controller = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    controller.verify();
  });
  // #endregion

  // #region [Tests]
  it('should be created', inject([SaverService], (service: SaverService) => {
    expect(service).toBeTruthy();
  }));

  it('saveFlashes -- (converts info to proper request)', 
    inject([SaverService], (service: SaverService) => {
      // send request
      service.saveFlashes(mock_info).subscribe(expectedResponse);
      // intercept request, ensure has expected properties;
      const req = controller.expectOne('/api/save/flashes');
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.workspace).toEqual('mock.example');
      expect(req.request.body.video).toEqual('video1');
      expect(req.request.body.flashes).toEqual([3.25]);
      // send mock response
      req.flush(mock_response);
  }));
  // #endregion
});
