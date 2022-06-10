import { Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OnWindowResizeService {
  screenType: string = 'laptop';
  constructor() { 
   this.screenType = (window.innerWidth <= 600) ? 'phone' : 'laptop';
   const breakpoint = window.innerWidth;
   if(breakpoint <= 480){
     this.screenType = 'phone'
   }
   else if(breakpoint <= 768){
    this.screenType = 'tablet'
   }
   else if(breakpoint <= 1024){
    this.screenType = 'laptop'
   }
   else if(breakpoint <= 1200){
    this.screenType = 'desktop'
   }
  }

  handleSizeEvent(event: UIEvent){
    const breakpoint = (event.target as Window).innerWidth;

    if(breakpoint <= 480){
      this.screenType = 'phone'
    }
    else if(breakpoint <= 768){
     this.screenType = 'tablet'
    }
    else if(breakpoint <= 1024){
     this.screenType = 'laptop'
    }
    else if(breakpoint <= 1200){
     this.screenType = 'desktop'
    }

    return this.screenType;
  }

  
   
  

  

}
