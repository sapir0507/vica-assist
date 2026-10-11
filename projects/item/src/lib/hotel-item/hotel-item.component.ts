import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, inject } from '@angular/core';
import { checkHotel, ConfigService, Hotel, labelOf, Order } from '@vica-assist/shared';

@Component({
  standalone: false,
  selector: 'hotel-item',
  templateUrl: './hotel-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./hotel-item.component.scss']
})
export class HotelItemComponent {
  @Input() hotel: Hotel | null = null;
  @Input() order?: Order | null;
  @Output() chosenHotel: EventEmitter<Hotel> = new EventEmitter();

  private configService = inject(ConfigService);

  get breakfastIncluded(): boolean {
    return String(this.hotel?.breakfast) === 'true';
  }

  get cancellationIncluded(): boolean {
    return this.hotel?.cancelation === 'included';
  }

  get bedLabel(): string {
    return labelOf(this.configService.config().bedTypes, this.hotel?.bedType);
  }

  /** What differs from the customer's request; `null` when there is no request to compare with. */
  get differences(): string[] | null {
    if (!this.hotel || !this.order) return null;
    return checkHotel(this.order, this.hotel, this.configService.config());
  }

  /** Only addresses a browser can load; the upload form currently stores a local file path, which cannot be shown. */
  get imageUrl(): string | null {
    const image = this.hotel?.image;
    return image && /^(https?:|data:image\/|assets\/)/.test(image) ? image : null;
  }

  onChosen(chosenHotel: Hotel){
    this.chosenHotel.emit(chosenHotel)
  }
}
