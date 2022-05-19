import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'user-homepage',
  templateUrl: './user-homepage.component.html',
  styleUrls: ['./user-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserHomepageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
