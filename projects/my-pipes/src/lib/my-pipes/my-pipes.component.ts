import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  templateUrl: './my-pipes.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./my-pipes.component.scss']
})
export class MyPipesComponent {
}
