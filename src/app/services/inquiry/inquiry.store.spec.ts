import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { Inquiry } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';
import { InquiryStore } from './inquiry.store';

const url = environment.api + 'inquiries';
const inquiry = (id: number, status: Inquiry['status'] = 'new'): Inquiry => ({ id, name: 'Dana', email: 'd@example.com', message: 'Hello there, I have a question.', createdAt: 'x', status });

describe('InquiryStore', () => {
  let store: InstanceType<typeof InquiryStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    store = TestBed.inject(InquiryStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the inquiries', () => {
    store.load();
    httpMock.expectOne(url).flush([inquiry(1), inquiry(2)]);

    expect(store.inquiries()).toHaveLength(2);
  });

  it('sends a visitor\'s inquiry as new, with the time', () => {
    store.submit({ name: 'Dana', email: 'd@example.com', message: 'Hello there' }).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({ name: 'Dana', status: 'new' });
    expect(Number.isNaN(Date.parse(req.request.body.createdAt))).toBe(false);
    req.flush({});
  });

  it('changes the status of an inquiry and updates the list', () => {
    store.load();
    httpMock.expectOne(url).flush([inquiry(1), inquiry(2)]);

    store.setStatus(2, 'answered').subscribe();

    const req = httpMock.expectOne(`${url}/2`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'answered' });
    req.flush(inquiry(2, 'answered'));
    expect(store.inquiries()?.map(item => item.status)).toEqual(['new', 'answered']);
  });
});
