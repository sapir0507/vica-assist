import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DestinationCardComponent } from '../../destinations/destination-card/destination-card.component';
import { DESTINATIONS } from '../../destinations/destinations';

@Component({
  standalone: true,
  selector: 'generic-homepage',
  templateUrl: './generic-homepage.component.html',
  styleUrls: ['./generic-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, DestinationCardComponent]
})
export class GenericHomepageComponent {
  readonly destinations = DESTINATIONS;

  readonly trustPoints = [
    { icon: 'badge', title: 'Real agents', text: 'A travel agent reads every request and handpicks the options for you.' },
    { icon: 'sell', title: 'Your budget', text: 'Tell us the most you want to spend and we stay within it.' },
    { icon: 'free_cancellation', title: 'All in one place', text: 'Follow your order from request to confirmed flights and hotel.' }
  ];
}
