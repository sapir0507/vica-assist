import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hotel, Order, provideAppIcons } from '@vica-assist/shared';

import { ItemModule } from '../item.module';
import { HotelItemComponent } from './hotel-item.component';

const hotel: Hotel = {
  id: 3,
  name: 'Sea View',
  stars: 4,
  guests: 2,
  breakfast: true,
  bedType: 'Queen bed',
  price: 120,
  moreInfo: 'Close to the beach'
};

describe('HotelItemComponent', () => {
  let component: HotelItemComponent;
  let fixture: ComponentFixture<HotelItemComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  const show = (value: Hotel) => {
    fixture.componentRef.setInput('hotel', value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemModule],
      providers: [provideAppIcons()]
    }).compileComponents();

    fixture = TestBed.createComponent(HotelItemComponent);
    component = fixture.componentInstance;
  });

  it('renders nothing without a hotel', () => {
    fixture.detectChanges();

    expect(host().querySelector('mat-card')).toBeNull();
  });

  it('shows the name, facts and price', () => {
    show(hotel);

    expect(host().textContent).toContain('Sea View');
    expect(host().textContent).toContain('2 guests');
    expect(host().textContent).toContain('Breakfast included');
    expect(host().textContent).toContain('Queen bed');
    expect(host().textContent).toContain('$120.00');
    expect(host().textContent).toContain('Close to the beach');
  });

  it('says when breakfast is not included', () => {
    show({ ...hotel, breakfast: false });

    expect(host().textContent).toContain('Breakfast not included');
  });

  it('describes the star rating for screen readers', () => {
    show(hotel);

    expect(host().querySelector('ngb-rating')?.getAttribute('aria-label')).toBe('4 out of 5 stars');
  });

  it('shows a loadable image and falls back to a placeholder otherwise', () => {
    show({ ...hotel, image: 'https://example.com/room.jpg' });
    expect(host().querySelector('img')?.getAttribute('src')).toBe('https://example.com/room.jpg');
    expect(host().querySelector('.hotel-card__placeholder')).toBeNull();

    show({ ...hotel, image: 'C:\\fakepath\\room.jpg' });
    expect(host().querySelector('img')).toBeNull();
    expect(host().querySelector('.hotel-card__placeholder')).not.toBeNull();
  });

  it('emits the hotel when Select hotel is clicked', () => {
    const emitted: Hotel[] = [];
    component.chosenHotel.subscribe(h => emitted.push(h));
    show(hotel);

    const select = Array.from<HTMLButtonElement>(host().querySelectorAll('button')).find(b => b.textContent?.includes('Select hotel'));
    select?.click();

    expect(emitted).toEqual([hotel]);
  });

  describe('cancellation and the customer\'s request', () => {
    const order = {
      id: 1,
      orderID: '1',
      choice: 'hotel',
      status: 'finished',
      origin: 'tel aviv',
      destination: 'paris', destinationId: 'paris',
      departureDate: '2026-06-09',
      returnDate: '2026-06-16',
      passDetails: [],
      priceRange: 1000,
      stars: 4,
      preferences: { hotel: { breakfast: true, bedType: 'king', freeCancellation: true, rooms: 1, area: 'any' } }
    } as unknown as Order;

    const showWith = (value: Hotel, customer?: Order) => {
      fixture.componentRef.setInput('hotel', value);
      if (customer) fixture.componentRef.setInput('order', customer);
      fixture.detectChanges();
    };

    it('only promises free cancellation when the agent said it is included', () => {
      showWith({ ...hotel, cancelation: 'included' });
      expect(host().textContent).toContain('Free cancellation');
      expect(host().textContent).not.toContain('No free cancellation');

      showWith({ ...hotel, cancelation: 'not included' });
      expect(host().textContent).toContain('No free cancellation');
    });

    it('says breakfast is not included when the agent saved "false" (it is a text value)', () => {
      showWith({ ...hotel, breakfast: 'false' as unknown as boolean });

      expect(host().textContent).toContain('Breakfast not included');
    });

    it('shows the bed by its label', () => {
      showWith({ ...hotel, bedType: 'king' });

      expect(host().textContent).toContain('King bed');
    });

    it('says the hotel matches the request', () => {
      showWith({ ...hotel, breakfast: true, bedType: 'king', cancelation: 'included', price: 300 }, order);

      expect(host().textContent).toContain('Matches your request');
    });

    it('lists how the hotel differs from the request', () => {
      showWith({ ...hotel, stars: 3, breakfast: false, bedType: 'twin', cancelation: 'not included', price: 300 }, order);

      expect(host().textContent).toContain('Differs from your request');
      expect(host().textContent).toContain('3 stars; the customer asked for at least 4.');
      expect(host().textContent).toContain('Free cancellation is not included');
    });

    it('does not compare without a request', () => {
      showWith(hotel);

      expect(component.differences).toBeNull();
    });
  });
});
