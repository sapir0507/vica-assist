import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HotelRequest } from '../my-hotels';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HotelsService } from './hotels.service';



@Component({
  selector: 'my-hotels',
  templateUrl: './my-hotels.component.html',
  styleUrls: ['./my-hotels.component.scss']
})
export class MyHotelsComponent {


  newHotelForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    stars: new FormControl(''),
    guests: new FormControl(''),
    breakfast: new FormControl(''),
    bedType: new FormControl(''),
    cancelation: new FormControl(''),
    images: new FormControl(''),
    moreInfo: new FormControl(''),
    price: new FormControl('')
  });  
  
  NewHotel?: HotelRequest;

  range: FormGroup = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  step = 0;
  hide = true;
  show = true;
  

  constructor(
    private Shotel: HotelsService,
    private _snackBar: MatSnackBar
    ) { 
    console.log('library')
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }
  
  prevStep() {
    this.step--;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message);
  }

  addHotel(){
    console.log('addHotel -> component')
    this.NewHotel = {
      name:this.newHotelForm.get('name')?.value,
      stars: this.newHotelForm.get('stars')?.value,
      guests:this.newHotelForm.get('guests')?.value,
      breakfast: this.newHotelForm.get('breakfast')?.value,
      bedType: this.newHotelForm.get('bedType')?.value,
      images: this.newHotelForm.get('images')?.value,
      moreInfo: this.newHotelForm.get('moreInfo')?.value,
      price: this.newHotelForm.get('price')?.value
    }
    this.Shotel.addHotel(this.NewHotel)
    this.openSnackBar("Hotel Added!")

  }
}
