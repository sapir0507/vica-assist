import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { OnWindowResizeService } from 'src/app/services/onWindowResize/on-window-resize.service';

export enum HeaderComponentType {
  NAVBAR = 'navbar',
  DROPDOWN_SIDEBAR = 'dropdown-sidebar'
}

@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  // Make the enum available to the template
  readonly HeaderComponentType = HeaderComponentType;

  private onResizeService = inject(OnWindowResizeService);
  navbarComponentIs = this.toHeaderType(this.onResizeService.screenType);

  private toHeaderType(screenType: string): HeaderComponentType {
    return screenType === 'phone' || screenType === 'tablet'
      ? HeaderComponentType.DROPDOWN_SIDEBAR
      : HeaderComponentType.NAVBAR;
  }

  handleSizeEvent(event: UIEvent) {
    this.navbarComponentIs = this.toHeaderType(this.onResizeService.handleSizeEvent(event));
  }
}
