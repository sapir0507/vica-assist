import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { API_URL, Order, provideAppIcons } from '@vica-assist/shared';

import { OrderStore } from 'src/app/services/order/order.store';
import { AgentHomepageComponent } from './agent-homepage.component';

describe('AgentHomepageComponent', () => {
  let component: AgentHomepageComponent;
  let fixture: ComponentFixture<AgentHomepageComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const button = (label: string) =>
    Array.from(host().querySelectorAll<HTMLButtonElement>('button')).find(b => b.textContent?.includes(label));

  const choose = (id: number) => {
    component.onChosen2({ id } as Order);
    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AgentHomepageComponent],
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }, provideAppIcons()],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the flight and hotel forms only once an order is chosen', () => {
    expect(host().querySelector('.workspace')).toBeNull();

    choose(3);

    expect(host().querySelector('lib-myFlights')).not.toBeNull();
    expect(host().querySelector('my-hotels')).toBeNull();
  });

  it('switches between the flight and hotel forms', () => {
    choose(3);

    button('Hotels')?.click();
    fixture.detectChanges();

    expect(host().querySelector('my-hotels')).not.toBeNull();
    expect(host().querySelector('lib-myFlights')).toBeNull();
    expect(button('Hotels')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('does not step past the first or the last order', () => {
    component.onGetMaxIDs(2);

    component.chosenIDPrev();
    expect(component.nextID).toBe(1);

    component.chosenIDNext();
    component.chosenIDNext();
    expect(component.nextID).toBe(2);
  });

  it('finds the chosen order in the store', () => {
    patchState(unprotected(TestBed.inject(OrderStore)), { orders: [{ id: 3, orderID: '3' } as Order] });
    component.onChosen2({ id: 3 } as Order);

    expect(component.order?.id).toBe(3);
  });
});
