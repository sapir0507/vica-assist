import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MyFlightsService } from 'projects/my-flights/src';
import { Hotel as myHotel } from 'src/interfaces/hotel.interface';
import { Hotel } from 'src/app/interfaces/hotel.interface';
import { finalOrder } from 'src/interfaces/final-order.interface';
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
    private finalOrderService: finalOrderService,
    private finalOrderStore: finalOrderStore,
    private finalOrderQuery: finalOrderQuery,
    private flightService: MyFlightsService
  ) { 
    finalOrderQuery.allfinalOrder$.pipe().subscribe( data => {
      console.log("data.flight", data.flight)
      console.log("data.hotel", data.hotel)
      console.log("data.order", data.order)
      
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
      // console.log(data)
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
