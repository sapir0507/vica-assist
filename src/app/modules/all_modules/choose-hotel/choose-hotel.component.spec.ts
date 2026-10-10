import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ItemModule } from '@vica-assist/item';
import { API_URL, Hotel, provideAppIcons } from '@vica-assist/shared';

import { ChooseHotelComponent } from './choose-hotel.component';

const hotel = (id: number, name: string): Hotel => ({ id, name, orderID: '2', stars: 4, guests: 2, price: 100 });

describe('ChooseHotelComponent', () => {
  let component: ChooseHotelComponent;
  let fixture: ComponentFixture<ChooseHotelComponent>;
  let httpMock: HttpTestingController;
  const host = () => fixture.nativeElement as HTMLElement;
  const hotelsUrl = (r: { url: string; params: { get(name: string): string | null } }) =>
    r.url === 'http://localhost:3000/hotels' && r.params.get('orderID') === '2';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }, provideAppIcons()],
      imports: [HttpClientTestingModule, ItemModule],
      declarations: [ChooseHotelComponent]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ChooseHotelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('orderID', '2');
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('asks the backend for the order\'s hotels exactly once', () => {
    httpMock.expectOne(hotelsUrl).flush([hotel(1, 'Sea View')]);
  });

  it('shows a card for every hotel and emits the one that is chosen', () => {
    const chosen: Hotel[] = [];
    component.chosenHotel.subscribe(h => chosen.push(h));
    httpMock.expectOne(hotelsUrl).flush([hotel(1, 'Sea View'), hotel(2, 'City Centre')]);
    fixture.detectChanges();

    expect(host().querySelectorAll('hotel-item')).toHaveLength(2);

    const select = Array.from<HTMLButtonElement>(host().querySelectorAll('button')).find(b => b.textContent?.includes('Select hotel'));
    select?.click();
    expect(chosen.map(h => h.name)).toEqual(['Sea View']);
  });

  it('says so when no hotels were added to the order', () => {
    httpMock.expectOne(hotelsUrl).flush([]);
    fixture.detectChanges();

    expect(host().textContent).toContain('No hotels have been added for this order yet.');
  });
});
