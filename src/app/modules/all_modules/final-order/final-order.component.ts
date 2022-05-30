import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MyFlightsService } from 'projects/my-flights/src';
import { map } from 'rxjs';

@Component({
  selector: 'app-final-order',
  templateUrl: './final-order.component.html',
  styleUrls: ['./final-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinalOrderComponent implements OnInit {
  myParam: string | null = null
  constructor(
    private route: ActivatedRoute,
    private flightService: MyFlightsService
  ) { 
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

}
