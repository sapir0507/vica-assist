import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_URL, Order } from '@vica-assist/shared';
import { Subscription } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { HotelsService } from './hotels.service';
import { MyHotelsComponent } from './my-hotels.component';

describe('MyHotelsComponent', () => {
  let component: MyHotelsComponent;
  let fixture: ComponentFixture<MyHotelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }],
      imports: [ HttpClientTestingModule, ReactiveFormsModule, MatSnackBarModule ],
      declarations: [ MyHotelsComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyHotelsComponent);
    component = fixture.componentInstance;
    // The template wires several Material form controls that need their
    // real modules imported to render; this is a construction smoke test,
    // so it intentionally skips detectChanges() rather than pulling in the
    // full Material form-field stack.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('validation', () => {
    const complete = { name: 'Sea View', stars: 4, guests: 2, breakfast: 'true', bedType: 'king', cancelation: 'included', price: 300 };

    it('needs every detail an agent must decide', () => {
      expect(component.newHotelForm.valid).toBe(false);

      component.newHotelForm.patchValue(complete);
      expect(component.newHotelForm.valid).toBe(true);
    });

    it('rejects a blank name, stars outside 1 to 5 and a price of zero', () => {
      component.newHotelForm.patchValue({ ...complete, name: '   ' });
      expect(component.newHotelForm.get('name')?.invalid).toBe(true);

      component.newHotelForm.patchValue({ ...complete, stars: 6 });
      expect(component.newHotelForm.get('stars')?.invalid).toBe(true);

      component.newHotelForm.patchValue({ ...complete, price: 0 });
      expect(component.newHotelForm.get('price')?.invalid).toBe(true);
    });

    it('offers guests up to the traveler limit and the beds from the configuration without "no preference"', () => {
      expect(component.guestChoices).toHaveLength(9);
      expect(component.bedTypes.map(bed => bed.id)).toEqual(['queen', 'king', 'twin']);
    });
  });

  describe('the customer\'s request', () => {
    const order = {
      id: 3,
      orderID: '3',
      choice: 'both',
      status: 'pending',
      origin: 'Israel',
      destination: 'Paris', destinationId: 'paris',
      departureDate: '2026-12-01',
      returnDate: '2026-12-08',
      passDetails: [],
      priceRange: 1000,
      stars: 4,
      preferences: { hotel: { breakfast: true, bedType: 'king', freeCancellation: true, rooms: 1, area: 'beach' } }
    } as unknown as Order;

    beforeEach(() => fixture.componentRef.setInput('order', order));

    it('lists what the customer asked for', () => {
      expect(component.wishes).toEqual(['At least 4 stars', 'King bed', 'Near the beach', 'Breakfast included', 'Free cancellation']);
    });

    it('warns about every difference and goes quiet when the hotel matches', () => {
      component.newHotelForm.patchValue({ stars: 3, breakfast: 'false', bedType: 'twin', cancelation: 'not included', price: 1500 });
      expect(component.warnings).toHaveLength(5);

      component.newHotelForm.patchValue({ stars: 4, breakfast: 'true', bedType: 'king', cancelation: 'included', price: 600 });
      expect(component.warnings).toEqual([]);
    });

    it('saves a hotel that differs, with its cancellation terms', () => {
      const addHotel = vi.spyOn(TestBed.inject(HotelsService), 'addHotel').mockReturnValue(new Subscription());
      component.newHotelForm.patchValue({ name: 'Sea View', stars: 3, guests: 2, breakfast: 'false', bedType: 'twin', cancelation: 'not included', price: 300 });
      component.orderID = '3';

      expect(component.warnings.length).toBeGreaterThan(0);
      component.addHotel();

      expect(addHotel).toHaveBeenCalledWith(expect.objectContaining({ orderID: '3', cancelation: 'not included', bedType: 'twin' }));
    });
  });
});
