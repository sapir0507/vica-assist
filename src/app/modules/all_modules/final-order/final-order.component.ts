import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MyFlightsService } from 'projects/my-flights/src';
import { Hotel as myHotel } from 'src/interfaces/hotel.interface';
import { Hotel } from 'src/app/interfaces/hotel.interface';
import { finalOrder, finalOrderRequest } from 'src/interfaces/final-order.interface';
import { finalOrderService } from 'src/app/services/finalOrder/finalOrder.service';
import { finalOrderQuery } from 'src/app/services/finalOrder/finalOrder.query';
import { Flights } from 'src/interfaces/flight.interface';
import { state } from '@angular/animations';
import { Order } from 'src/interfaces/order.interface';
import { finalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';

@Component({
  selector: 'app-final-order',
  templateUrl: './final-order.component.html',
  styleUrls: ['./final-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinalOrderComponent implements OnInit {
  myParam: string | null = null;
  finalOrder: finalOrder = {id: 1};

  constructor(
    private route: ActivatedRoute,
    private finalOrderStore: finalOrderStore,
    private router: Router,
    private finalOrderQuery: finalOrderQuery,
    private finalOrderService: finalOrderService,
    private flightService: MyFlightsService
  ) { 
    this.finalOrderQuery.allfinalOrder$.pipe().subscribe( data => {
      if(data.flight&&data.hotel&&data.order){
        //service update finished order
        this.finalOrderService.addfinalOrder(data);
        //routing to success page
        this.router.navigate(['user-finished-order']);

      }
    } )
  }

  ngOnInit(): void {
    this.myParam = this.route.snapshot.paramMap.get('id'); //gets the id param from the url
    if(this.myParam){
      this.getFlight(this.myParam)
    }
  }

  private getFlight(flightID: string){
    this.flightService.getFlightsByOrderID(flightID).subscribe(data=>{
       console.log(data)
    })
  }

  onChosenFlight(Chosenflight: Flights){
    this.finalOrder.flight = Chosenflight;
    this.finalOrderStore.update((state: finalOrder) => ({
      ...state,
      flight: Chosenflight
    }))
  }

  onChosenHotel(ChosenHotel:  Hotel){
    this.finalOrder.hotel = ChosenHotel;
    this.finalOrderStore.update((state: finalOrder)=>({
      ...state,
      hotel: ChosenHotel
    }))
  }

}
