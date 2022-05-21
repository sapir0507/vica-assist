import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'agent-homepage',
  templateUrl: './agent-homepage.component.html',
  styleUrls: ['./agent-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentHomepageComponent implements OnInit {
  step: string = 'flight';
  chosenID: number = 1;
  nextID: number = 1;
  maxID: number = 1;
  constructor() { }

  ngOnInit(): void {
  }
  onClick(){
    if(this.step ==='hotel') this.step ='flight';
    else this.step = 'hotel';
  }

  onGetMaxIDs(maxIDs: number){    
    this.maxID = maxIDs;
  }

  chosenIDNext(){
    if(this.maxID >= this.nextID + 1) this.nextID++;
  }

  chosenIDPrev(){
    if((this.nextID - 1) > 0 ) this.nextID--;
  }

  onChosen(id: number){
    console.log("homepage id:", id)
    this.chosenID = id;
  }

}
