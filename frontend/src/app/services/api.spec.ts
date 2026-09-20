import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Api } from './api';
describe('Api contracts', () => {
  let api: Api;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(Api);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses dedicated assignment and resolution paths', () => {
    api.assignIncident(12, 7).subscribe();
    api.assignIncidentCategory(12, 4).subscribe();
    api.resolveIncident(12).subscribe();
    for (const path of [
      '/incidents/12/assign/7',
      '/incidents/12/category/4',
      '/incidents/12/resolve',
    ]) {
      const req = http.expectOne('http://localhost:8080' + path);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    }
  });
  it('creates customer messages with txt and the selected customer path', () => {
    api.createMessageForCustomer(8, { txt: 'Help please' }).subscribe();
    const req = http.expectOne('http://localhost:8080/messages/customer/8');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ txt: 'Help please' });
    req.flush({});
  });
  it('retains the existing ticket analyze endpoint', () => {
    api.analyzeTicket(9).subscribe();
    const req = http.expectOne('http://localhost:8080/tickets/9/analyze');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
