import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'generic-homepage',
  templateUrl: './generic-homepage.component.html',
  styleUrls: ['./generic-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericHomepageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
