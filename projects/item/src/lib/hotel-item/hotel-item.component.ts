import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Hotel } from '@vica-assist/shared';

@Component({
  standalone: false,
  selector: 'hotel-item',
  templateUrl: './hotel-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./hotel-item.component.scss']
})
export class HotelItemComponent {
  @Input() hotel: Hotel | null = null;
  @Output() chosenHotel: EventEmitter<Hotel> = new EventEmitter();

  /** Only addresses a browser can load; the upload form currently stores a local file path, which cannot be shown. */
  get imageUrl(): string | null {
    const image = this.hotel?.image;
    return image && /^(https?:|data:image\/|assets\/)/.test(image) ? image : null;
  }

  onChosen(chosenHotel: Hotel){
    this.chosenHotel.emit(chosenHotel)
  }
}
