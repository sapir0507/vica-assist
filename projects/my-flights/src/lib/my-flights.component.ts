import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-myFlights',
  templateUrl: './my-flights.component.html',
  styles: []
})
export class MyFlightsComponent implements OnInit {

  constructor() { 
    console.log('library');
  }

  ngOnInit(): void {
  }

}
