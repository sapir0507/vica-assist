import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'finished-order',
  templateUrl: './user-finished-order.component.html',
  styleUrls: ['./user-finished-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFinishedOrderComponent implements OnInit {
  myParam: string = ''
  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log(this.route.snapshot.paramMap.get('id'))
  }

}
