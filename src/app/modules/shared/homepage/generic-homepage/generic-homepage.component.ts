import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  standalone: true,
  selector: 'generic-homepage',
  templateUrl: './generic-homepage.component.html',
  styleUrls: ['./generic-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
      MatButtonModule,
     MatListModule,
  ]
})
export class GenericHomepageComponent implements OnInit {

  constructor() { /* empty*/}
  ngOnInit(): void {/* empty*/}

}
