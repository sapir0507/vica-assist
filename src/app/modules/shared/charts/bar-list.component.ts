import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface BarItem {
  label: string;
  count: number;
}

@Component({
  standalone: true,
  selector: 'bar-list',
  templateUrl: './bar-list.component.html',
  styleUrls: ['./bar-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarListComponent {
  items = input.required<BarItem[]>();

  private highest = computed(() => Math.max(1, ...this.items().map(item => item.count)));

  share(item: BarItem): number {
    return (item.count / this.highest()) * 100;
  }
}
