import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideAppIcons } from '@vica-assist/shared';

import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileUploadComponent ],
      imports: [MatButtonModule, MatIconModule],
      providers: [provideAppIcons()]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('says that nothing has been chosen yet', () => {
    expect(host().textContent).toContain('No photos chosen yet');
  });

  it('shows the chosen file names and emits the files', () => {
    const chosen: File[][] = [];
    component.files.subscribe(files => chosen.push(files));
    const photos = [new File(['a'], 'room.jpg'), new File(['b'], 'view.png')];

    const input = host().querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: photos });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(host().textContent).toContain('room.jpg, view.png');
    expect(chosen).toEqual([photos]);
  });
});
