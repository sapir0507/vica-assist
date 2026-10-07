import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'generic-homepage',
  templateUrl: './generic-homepage.component.html',
  styleUrls: ['./generic-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
      MatButtonModule,
     MatCardModule,
     MatIconModule,
     MatTabsModule,
     MatListModule,
  ]
})
export class GenericHomepageComponent implements OnInit {

  constructor() { /* empty*/}
  ngOnInit(): void {/* empty*/}

}
