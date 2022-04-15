import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Ihotel } from 'src/app/services/hotel/ihotel';
import { ShotelService } from 'src/app/services/hotel/shotel.service';

@Component({
  selector: 'app-add-new-hotel',
  templateUrl: './add-new-hotel.component.html',
  styleUrls: ['./add-new-hotel.component.scss']
})
export class AddNewHotelComponent implements OnInit {

  newHotelForm = new FormGroup({
    hotelName: new FormControl(''),
    hotelStarNum: new FormControl(''),
    hotelBreakfast: new FormControl(''),
    hotelBeds: new FormControl(''),
    hotelPrice: new FormControl('')
  });

  NewHotel: Ihotel | null = null;

  constructor(private SHotel: ShotelService) { }

  ngOnInit(): void {
  }

  addHotel(){
    console.log('addHotel -> component')
    this.NewHotel = {
      hotelID: this.SHotel.getNewID(),
      hotelName:this.newHotelForm.get('hotelName')?.value,
      hotelStarNum: this.newHotelForm.get('hotelStarNum')?.value,
      hotelBreakfast: this.newHotelForm.get('hotelBreakfast')?.value,
      hotelBeds: this.newHotelForm.get('hotelBeds')?.value,
      hotelPrice: this.newHotelForm.get('hotelPrice')?.value
    }
    this.SHotel.addHotel(this.NewHotel)
  }

}
