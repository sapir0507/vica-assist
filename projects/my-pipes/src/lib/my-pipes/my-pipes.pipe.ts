import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'Capitalize'})
export class Capitalize implements PipeTransform {
  transform(value: string): string { 
    return  value[0].toUpperCase() + value.substring(1).toLocaleLowerCase();
  }
}
