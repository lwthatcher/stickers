// Http testing module and mocking controller
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { SaverService } from './saver.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

// #region [Constants]
const mock = {
  flashes: {
    info: { workspace: 'mock.example', name: 'V1', flashes: [3.25] },
    response: { success: true, msg: "good job!", flashes: [3.25], datum: {} }
  },
  labels: {
    scheme: { workspace: 'mock.example', name: 'L1', event_map: {'1': 'ducks', '2': 'not-ducks'} },
    labels: [{start:70378.82, end:83607.92,label: 1, type: 'ducks', id:0, selected:false},
             {start:172507.49, end:192880.30, label: 2, type: 'not-ducks', id:1, selected:true},
             {start:132291.02, end:172507.49,label: 0, type: 'Ø', id:2, selected:false}],
    response: { success: true, msg: 'nice haircut', 
                path: '/mock/example/L1.labels.json', 
                new: true, datum: {} }
  }
}
// #endregion

// #region [Helper Methods]
function expected(mocked) { return (res) => expect(res).toEqual(mocked.response) }
// #endregion

describe('SaverService', () => {
  // #region [Variables]
  let controller: HttpTestingController;
  // #endregion

  // #region [Setup]
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SaverService]
    });
  });

  beforeEach(() => {
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

  it('saveFlashes -- (proper request)', 
    inject([SaverService], (service: SaverService) => {
      // send request
      service.saveFlashes(mock.flashes.info).subscribe(expected(mock.flashes));
      // intercept request, ensure has expected properties;
      const req = controller.expectOne('/api/save/flashes');
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.workspace).toEqual('mock.example');
      expect(req.request.body.video).toEqual('V1');
      expect(req.request.body.flashes).toEqual([3.25]);
      // send mock response
      req.flush(mock.flashes.response);
  }));

  it('saveLabels -- (proper request)', 
    inject([SaverService], (service: SaverService) => {
      service.saveLabels(mock.labels.scheme, mock.labels.labels).subscribe(expected(mock.labels));
      const req = controller.expectOne('/api/save/labels');
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.workspace).toEqual('mock.example');
      expect(req.request.body.scheme).toEqual('L1');
      expect(req.request.body.labels.length).toEqual(3);
      req.flush(mock.labels.response);
  }));

  it('saveLabels -- (cleans labels)', 
    inject([SaverService], (service: SaverService) => {
      service.saveLabels(mock.labels.scheme, mock.labels.labels).subscribe(expected(mock.labels));
      const req = controller.expectOne('/api/save/labels');
      expect(req.request.body.labels[0]).toEqual({start:70378.82, end:83607.92,label: 1});
      expect(req.request.body.labels[1]).toEqual({start:172507.49, end:192880.30, label: 2});
      expect(req.request.body.labels[2]).toEqual({start:132291.02, end:172507.49,label: 0});
      expect(req.request.body.labels[0].type).toBeUndefined();
      expect(req.request.body.labels[1].selected).toBeUndefined();
      expect(req.request.body.labels[2].id).toBeUndefined();
      req.flush(mock.labels.response);
  }));

  it('saveLabels -- ("event_map" -> "event-map")', 
    inject([SaverService], (service: SaverService) => {
      service.saveLabels(mock.labels.scheme, mock.labels.labels).subscribe(expected(mock.labels));
      const req = controller.expectOne('/api/save/labels');
      expect(req.request.body['event_map']).toBeUndefined();
      expect(req.request.body['event-map']).toBeDefined();
      expect(req.request.body['event-map']).toEqual({'1': 'ducks', '2': 'not-ducks'});
      req.flush(mock.labels.response);
  }));
  // #endregion
});
