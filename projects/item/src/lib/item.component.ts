import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
