import { Injectable } from '@angular/core';
import { Iflight } from './iflight';

@Injectable({
  providedIn: 'root'
})
export class SflightService {
  FLIGHTS: Iflight[] | null = null;
  constructor() { }

  getAreThereFlights(): boolean{
    return this.FLIGHTS? true: false;
  }

  addFlight(newFlight: Iflight): void {
      console.log("adding flight -> service")
      console.log("value to add is:", newFlight)
      console.log("Adding...")
      this.FLIGHTS? this.FLIGHTS.push(newFlight): this.FLIGHTS = [newFlight];
      console.log("FLIGHTS:", this.FLIGHTS)
  }

  getNewID(): number{
    return this.FLIGHTS? this.FLIGHTS.length : 0;
  }

  removeFlight(RFlightID: number):void{
    console.log("remove flight -> service")
    console.log("Removing flight...")
    if(this.FLIGHTS){
       this.FLIGHTS = this.FLIGHTS?.filter(flight => flight.flightID != RFlightID)
    }
    console.log("FLIGHTS:", this.FLIGHTS)
  }

  getFlight(FlightID: number){
    const result = this.FLIGHTS?.filter(flight => flight.flightID === FlightID)
    console.log("flight with id:", FlightID, "is:", result)
    return result; 
  }

  getCities(){
    //get list of 10 cities
  }
  getCountries(){
    //get list of 10 countries
  }
  getAirways(){
    //get list of 10 airways
  }
  getAirport_landing(){}

}
