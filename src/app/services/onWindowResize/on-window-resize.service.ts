import { Injectable, Input, Output } from '@angular/core';
import { debounceTime, fromEvent } from 'rxjs';
import { ILinks } from '../links/links';
import { IScreenType } from './iscreen-type';

@Injectable({
  providedIn: 'root'
})
export class OnWindowResizeService {
  private resize = fromEvent(window, 'resize');
  // public myScreen: IScreenType | null = null;
  // public navbarComponentIs: IScreenType[] = [{
  //   ID: 0,
  //   screenType: 'computer'
  // },
  // {
  //   ID: 1,
  //   screenType: 'phone'
  // }]
  
  constructor() { 
    // this.myScreen = window.innerWidth < 800 ? {ID: 1, screenType: 'phone'}: {ID: 0, screenType: 'computer'}
  }

  monitor_resizing(@Input() windowNewSize: number){
    return this.resize
    .pipe(debounceTime(300))
    .subscribe(x => {
      windowNewSize = window.innerWidth < 800? 1:2;
      console.log(x, "inner width: ", window.innerWidth)
      console.log('window new size: ', windowNewSize)
      return windowNewSize;
   });
   
  }

  

}
