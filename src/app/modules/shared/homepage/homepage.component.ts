import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  step: string = 'hotel';
  constructor() { }

  ngOnInit(): void {
  }

  onClick(){
    if(this.step ==='hotel') this.step ='flight';
    else this.step = 'hotel';
  }
}
