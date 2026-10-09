import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor() { /* empty*/}
  ngOnInit(): void {/* empty*/}

}
