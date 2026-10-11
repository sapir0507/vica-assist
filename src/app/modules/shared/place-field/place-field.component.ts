import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { suggestPlaces } from '@vica-assist/shared';

@Component({
  standalone: true,
  selector: 'place-field',
  templateUrl: './place-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule]
})
export class PlaceFieldComponent {
  control = input.required<FormControl>();
  label = input.required<string>();
  hint = input('');
  blankMessage = input('Enter a place.');

  get suggestions(): string[] {
    return suggestPlaces(this.control().value);
  }
}
