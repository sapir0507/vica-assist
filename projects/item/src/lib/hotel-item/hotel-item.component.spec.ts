import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hotel, provideAppIcons } from '@vica-assist/shared';

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
});
