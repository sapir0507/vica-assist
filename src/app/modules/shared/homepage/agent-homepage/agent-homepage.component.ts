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
    if(this.maxID >= this.chosenID + 1) this.chosenID++;
  }

  chosenIDPrev(){
    if((this.chosenID - 1) > 0) this.chosenID--;
  }

  onChosen(id: number){
    console.log("homepage id:", id)
    this.chosenID = id;
  }

}
