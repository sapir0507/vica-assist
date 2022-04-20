
import { Component, Input, OnInit } from '@angular/core';
import { Hotel } from 'src/app/services/hotel/ihotel';

@Component({
  selector: 'app-hotel',
  templateUrl: './hotel.component.html',
  styleUrls: ['./hotel.component.scss']
})
export class HotelComponent implements OnInit {
  @Input() hotel: Hotel | null = null;
  constructor() { }

  ngOnInit(): void {
    
  }

  getStarPath(stars?: number ){
    console.log("stars", stars)
    if(stars != null){
     switch (stars) {
      case 1:
        return 'assets/images/icon/oneS.png'

      case 2:
        return 'assets/images/icon/oneS.png'
       
      case 3:
        return 'assets/images/icon/threeS.png'
     
      case 4:
        return 'assets/images/icon/fourS.png'
      
      case 5:
        return 'assets/images/icon/fiveS.png'
     
    
      default:
        return ''
       
    }
  }
  else return 'assets/images/icons/oneS.png';

  }
}
