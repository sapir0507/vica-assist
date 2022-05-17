import { HttpClient } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'fileUploader',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent  {
  // @Output() files: FormData = new FormData();
  @Output() files: EventEmitter<File[] > = new EventEmitter<File[] >();
  fileName?: string;

  constructor(
    private http: HttpClient
  ) {}

  onUpload(event: any): void{

    // const file:File = event.target.files[0];

    const chosenFiles: File[] = event.target.files;

    const formData: FormData = new FormData();

    this.files.emit(chosenFiles)
  }
}
