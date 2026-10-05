import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MyFlightsService } from 'projects/my-flights/src';
import { Hotel } from 'src/app/interfaces/hotel.interface';
import { FinalOrderState, FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { Flights } from 'src/interfaces/flight.interface';

@Component({
  standalone: false,
  selector: 'app-final-order',
  templateUrl: './final-order.component.html',
  styleUrls: ['./final-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinalOrderComponent implements OnInit {
  myParam: string | null = null;

  protected finalOrderStore = inject(FinalOrderStore);
  private router = inject(Router);
  private flightService = inject(MyFlightsService);

  constructor(
    private route: ActivatedRoute
  ) {
    effect(() => {
      const data: FinalOrderState = {
        order: this.finalOrderStore.order(),
        flight: this.finalOrderStore.flight(),
        hotel: this.finalOrderStore.hotel()
      };
      if(this.isFinished(data)){
        //service update finished order
        this.finalOrderStore.addFinalOrder(data);
        //routing to success page
        this.router.navigate(['user-finished-order']);

      }
    })
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
    this.finalOrderStore.update({ flight: Chosenflight })
  }

  onChosenHotel(ChosenHotel:  Hotel){
    this.finalOrderStore.update({ hotel: ChosenHotel })
  }

  isFinished(data: FinalOrderState){

    console.log(data)

    switch (data.order?.choice) {
      case 'both':
        return data.flight&&data.hotel? true: false;
        break;
      case 'flight':
        return data.flight? true: false;
        break
      case 'hotel':
        return data.hotel? true: false;
        break
      default:
        return false;
        break;
    }

  }

}
