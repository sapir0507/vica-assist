import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Flights, Hotel, provideAppIcons } from '@vica-assist/shared';

import { ItemComponent, ItemType } from './item.component';
import { ItemModule } from './item.module';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemModule],
      providers: [provideAppIcons()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('renders nothing until it has an item', () => {
    fixture.detectChanges();

    expect(host().querySelector('flight-item, hotel-item')).toBeNull();
  });

  it('renders a flight card for a flight item and re-emits the choice', () => {
    const flight = { id: 1, org: 'a', dest: 'b' } as Flights;
    const chosen: Flights[] = [];
    component.chosenFlight.subscribe(f => chosen.push(f));
    fixture.componentRef.setInput('item_type', ItemType.Flight);
    fixture.componentRef.setInput('flight', flight);
    fixture.detectChanges();

    expect(host().querySelector('flight-item')).not.toBeNull();
    expect(host().querySelector('hotel-item')).toBeNull();

    const select = Array.from<HTMLButtonElement>(host().querySelectorAll('button')).find(b => b.textContent?.includes('Select flight'));
    select?.click();
    expect(chosen).toEqual([flight]);
  });

  it('renders a hotel card for a hotel item and re-emits the choice', () => {
    const hotel = { id: 2, name: 'Sea View' } as Hotel;
    const chosen: Hotel[] = [];
    component.chosenHotel.subscribe(h => chosen.push(h));
    fixture.componentRef.setInput('item_type', ItemType.Hotel);
    fixture.componentRef.setInput('hotel', hotel);
    fixture.detectChanges();

    expect(host().querySelector('hotel-item')).not.toBeNull();
    expect(host().querySelector('flight-item')).toBeNull();

    const select = Array.from<HTMLButtonElement>(host().querySelectorAll('button')).find(b => b.textContent?.includes('Select hotel'));
    select?.click();
    expect(chosen).toEqual([hotel]);
  });
});
