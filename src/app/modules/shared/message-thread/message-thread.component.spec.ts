import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { Order } from '@vica-assist/shared';

import { environment } from 'src/environments/environment';
import { MessageThreadComponent } from './message-thread.component';

const url = environment.api + 'messages';

const order: Order = {
  id: 7, orderID: '7', choice: 'both', status: 'pending', departureDate: '', returnDate: '', origin: '', destination: '', passDetails: [], priceRange: 0,
  customer: 'dana', agent: 'noa'
};

describe('MessageThreadComponent', () => {
  let fixture: ComponentFixture<MessageThreadComponent>;
  let httpMock: HttpTestingController;
  const host = () => fixture.nativeElement as HTMLElement;
  const send = () => host().querySelector<HTMLButtonElement>('button[type="submit"]') as HTMLButtonElement;
  const type = (text: string) => {
    const area = host().querySelector('textarea') as HTMLTextAreaElement;
    area.value = text;
    area.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const create = (role: 'customer' | 'agent', author: string) => {
    fixture = TestBed.createComponent(MessageThreadComponent);
    fixture.componentRef.setInput('order', order);
    fixture.componentRef.setInput('role', role);
    fixture.componentRef.setInput('author', author);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url === url && r.params.get('orderId') === '7').flush([
      { id: 1, orderId: 7, from: 'agent', author: 'noa', text: 'Welcome <b>aboard</b>', sentAt: '2026-10-01T09:00:00.000Z' },
      { id: 2, orderId: 7, from: 'system', author: 'vica-assist', text: 'The customer changed this request.', sentAt: '2026-10-01T10:00:00.000Z' }
    ]);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MessageThreadComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows the conversation, as text only, telling apart the other side, the system and you', () => {
    create('customer', 'dana');

    const items = host().querySelectorAll('.message');
    expect(items).toHaveLength(2);
    expect(items[0].querySelector('.message__text')?.textContent).toBe('Welcome <b>aboard</b>');
    expect(items[0].querySelector('b')).toBeNull();
    expect(items[0].textContent).toContain('noa');
    expect(items[1].classList).toContain('message--system');
  });

  it('marks the agent\'s own messages as theirs when an agent reads the thread', () => {
    create('agent', 'noa');

    expect(host().querySelector('.message--mine')?.textContent).toContain('You');
  });

  it('sends a message, empties the box and shows it in the thread', () => {
    create('customer', 'dana');
    type('  A window seat, please  ');
    expect(send().disabled).toBe(false);

    send().click();
    const post = httpMock.expectOne(url);
    expect(post.request.body).toMatchObject({ orderId: 7, from: 'customer', author: 'dana', text: 'A window seat, please' });
    post.flush({ ...post.request.body, id: 3 });
    fixture.detectChanges();

    expect(host().querySelectorAll('.message')).toHaveLength(3);
    expect((host().querySelector('textarea') as HTMLTextAreaElement).value).toBe('');
  });

  it('cannot send nothing, or more than the limit', () => {
    create('customer', 'dana');
    expect(send().disabled).toBe(true);

    type('   ');
    expect(send().disabled).toBe(true);

    type('a'.repeat(1001));
    expect(send().disabled).toBe(true);
    expect(host().querySelector('[role="alert"]')?.textContent).toContain('1000 characters');

    type('a'.repeat(1000));
    expect(send().disabled).toBe(false);
    expect(host().textContent).toContain('1000 / 1000');
  });

  it('says why a message could not be sent', () => {
    create('customer', 'not-the-owner');
    type('hello');

    send().click();
    fixture.detectChanges();

    expect(host().querySelector('[role="alert"]')?.textContent).toContain('You cannot write in this conversation.');
  });
});
