import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Ihotel, IhotelRequest } from 'src/app/services/hotel/ihotel';
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

  NewHotel: IhotelRequest | null = null;

  constructor(private SHotel: ShotelService) { }

  ngOnInit(): void {
  }

  addHotel(){
    console.log('addHotel -> component')
    const isBreakfast = this.newHotelForm.get('hotelBreakfast')?.value === 'included'? true: false
    this.NewHotel = {
      Name:this.newHotelForm.get('hotelName')?.value,
      stars: this.newHotelForm.get('hotelStarNum')?.value,
      breakfast: isBreakfast,
      bedsIncluded: this.newHotelForm.get('hotelBeds')?.value,
      price: this.newHotelForm.get('hotelPrice')?.value
    }
    this.SHotel.addHotel(this.NewHotel)
  }

}
