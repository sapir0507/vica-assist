import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'fileUploader',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent  {
  @Output() files: EventEmitter<File[] > = new EventEmitter<File[] >();
  fileName?: string;

  onUpload(event: any): void{
    const chosenFiles: File[] = event.target.files;
    this.files.emit(chosenFiles)
  }
}
