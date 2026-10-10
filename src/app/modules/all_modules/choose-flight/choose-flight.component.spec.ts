import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ItemModule } from '@vica-assist/item';
import { Flights, provideAppIcons } from '@vica-assist/shared';

import { environment } from 'src/environments/environment';
import { ChooseFlightComponent } from './choose-flight.component';

const flight = (id: number, dest: string): Flights => ({ id, orderID: '2', org: 'tel aviv', dest, price: 450 });

describe('ChooseFlightComponent', () => {
  let component: ChooseFlightComponent;
  let fixture: ComponentFixture<ChooseFlightComponent>;
  let httpMock: HttpTestingController;
  const host = () => fixture.nativeElement as HTMLElement;
  const flightsUrl = (r: { url: string; params: { get(name: string): string | null } }) =>
    r.url === environment.api + 'flights' && r.params.get('orderID') === '2';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideAppIcons()],
      imports: [HttpClientTestingModule, ItemModule],
      declarations: [ChooseFlightComponent]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ChooseFlightComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('orderID', '2');
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('asks the backend for the order\'s flights exactly once', () => {
    httpMock.expectOne(flightsUrl).flush([flight(1, 'paris')]);
  });

  it('shows a card for every flight and emits the one that is chosen', () => {
    const chosen: Flights[] = [];
    component.chosenFlight.subscribe(f => chosen.push(f));
    httpMock.expectOne(flightsUrl).flush([flight(1, 'paris'), flight(2, 'rome')]);
    fixture.detectChanges();

    expect(host().querySelectorAll('flight-item')).toHaveLength(2);

    const select = Array.from<HTMLButtonElement>(host().querySelectorAll('button')).find(b => b.textContent?.includes('Select flight'));
    select?.click();
    expect(chosen.map(f => f.dest)).toEqual(['paris']);
  });

  it('says so when no flights were added to the order', () => {
    httpMock.expectOne(flightsUrl).flush([]);
    fixture.detectChanges();

    expect(host().textContent).toContain('No flights have been added for this order yet.');
  });
});
