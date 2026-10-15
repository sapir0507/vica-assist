import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { Message, Order } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';
import { MessageStore } from './message.store';

const url = environment.api + 'messages';

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 7,
  orderID: '7',
  choice: 'both',
  status: 'pending',
  departureDate: '',
  returnDate: '',
  origin: '',
  destination: '', destinationId: 'paris',
  passDetails: [],
  priceRange: 0,
  customer: 'dana',
  agent: 'noa',
  ...overrides
});

describe('MessageStore', () => {
  let store: InstanceType<typeof MessageStore>;
  let httpMock: HttpTestingController;
  const errorOf = (observable: ReturnType<typeof store.send>) => {
    let message = '';
    observable.subscribe({ error: (e: Error) => (message = e.message) });
    return message;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    store = TestBed.inject(MessageStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the messages of one request', () => {
    store.load(7);

    const req = httpMock.expectOne(r => r.url === url && r.params.get('orderId') === '7');
    req.flush([{ id: 1, orderId: 7, from: 'customer', author: 'dana', text: 'hi', sentAt: 'x' }]);

    expect(store.messagesOf(7)).toHaveLength(1);
    expect(store.messagesOf(8)).toEqual([]);
  });

  it('lets the customer write, trimming the text and adding it to the thread', () => {
    let sent: Message | undefined;
    store.send(order(), 'customer', 'dana', '  Is a window seat possible?  ').subscribe(m => (sent = m));

    const req = httpMock.expectOne(url);
    expect(req.request.body).toMatchObject({ orderId: 7, from: 'customer', author: 'dana', text: 'Is a window seat possible?' });
    req.flush({ ...req.request.body, id: 1 });

    expect(sent?.text).toBe('Is a window seat possible?');
    expect(store.messagesOf(7)).toHaveLength(1);
  });

  it('lets the assigned agent write', () => {
    store.send(order(), 'agent', 'noa', 'Yes, of course.').subscribe();

    expect(httpMock.expectOne(url).request.body.from).toBe('agent');
  });

  it('lets any agent write on a request nobody was given', () => {
    store.send(order({ agent: undefined }), 'agent', 'lee', 'Hello').subscribe();

    httpMock.expectOne(url);
  });

  it('refuses another customer, another agent and a customer on a request without an owner', () => {
    expect(errorOf(store.send(order(), 'customer', 'someone', 'hi'))).toBe('You cannot write in this conversation.');
    expect(errorOf(store.send(order(), 'agent', 'lee', 'hi'))).toBe('You cannot write in this conversation.');
    expect(errorOf(store.send(order({ customer: undefined }), 'customer', 'dana', 'hi'))).toBe('You cannot write in this conversation.');
  });

  it('refuses empty text and text over the limit from the configuration', () => {
    expect(errorOf(store.send(order(), 'customer', 'dana', '   '))).toBe('Write a message first.');
    expect(errorOf(store.send(order(), 'customer', 'dana', 'a'.repeat(1001)))).toBe('Keep the message to 1000 characters or fewer.');
    store.send(order(), 'customer', 'dana', 'a'.repeat(1000)).subscribe();
    httpMock.expectOne(url);
  });

  it('writes a note from the app itself', () => {
    store.note(7, 'The customer changed this request.').subscribe();

    expect(httpMock.expectOne(url).request.body).toMatchObject({ orderId: 7, from: 'system', text: 'The customer changed this request.' });
  });
});
