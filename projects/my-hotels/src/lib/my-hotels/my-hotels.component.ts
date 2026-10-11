import { Component, Input, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HotelsService } from './hotels.service';
import { activeOptions, checkHotel, ConfigService, describePreferences, HotelRequest, Order } from '@vica-assist/shared'
import { Subject, Subscription } from 'rxjs';



@Component({
  standalone: false,
  selector: 'my-hotels',
  templateUrl: './my-hotels.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./my-hotels.component.scss']
})
export class MyHotelsComponent implements OnDestroy {
  @Input() orderID: string | null = null; //id of order
  @Input() order?: Order; //the customer's request, for their wishes
  private configService = inject(ConfigService);
  notifier: Subject<boolean> = new Subject();
  fileName?: string;
  myObservable?: Subscription;
  files: FormData = new FormData();
  newHotelForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(60), Validators.pattern(/\S/)]),
    stars: new FormControl('', [Validators.required, Validators.min(1), Validators.max(5)]),
    guests: new FormControl('', [Validators.required, Validators.min(1)]),
    breakfast: new FormControl('', Validators.required),
    bedType: new FormControl('', Validators.required),
    cancelation: new FormControl('', Validators.required),
    images: new FormControl(''),
    moreInfo: new FormControl(''),
    price: new FormControl('', [Validators.required, Validators.min(1)])
  });  
  
  NewHotel?: HotelRequest;

  range: FormGroup = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  step = 0;
  hide = true;
  show = true;
  

  get guestChoices(): number[] {
    return Array.from({ length: this.configService.config().limits.maxTravelers }, (_, index) => index + 1);
  }

  get bedTypes() {
    return activeOptions(this.configService.config().bedTypes).filter(bed => bed.id !== 'any');
  }

  get wishes(): string[] {
    const lines = describePreferences(this.order?.preferences, this.configService.config());
    const stars = this.order?.stars ? [`At least ${this.order.stars} stars`] : [];
    return [...stars, ...lines.hotel];
  }

  get warnings(): string[] {
    const value = this.newHotelForm.value;
    return checkHotel(this.order, {
      stars: value.stars,
      breakfast: value.breakfast,
      bedType: value.bedType,
      cancelation: value.cancelation,
      price: value.price
    }, this.configService.config());
  }

  constructor(
    private Shotel: HotelsService,
    private _snackBar: MatSnackBar
    ) { }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }
  
  prevStep() {
    this.step--;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpload(event: any): void{

    const file:File = event.target.files[0];

    console.log("event", this.files)
    this.fileName = file.name;
  
  }

  onImagesChosen(images: File[] ){
    console.log(images)
    if(images){
      images.forEach(image => {
        console.log(image.name, image)
        this.files.append("image", image, image.name)
      })
    }
    
  }

  openSnackBar(message: string) {
    this._snackBar.open(message);
  }

  addHotel(){
    if(this.newHotelForm.valid && this.orderID){
    this.NewHotel = {
      orderID: this.orderID,
      name:this.newHotelForm.get('name')?.value,
      stars: this.newHotelForm.get('stars')?.value,
      guests:this.newHotelForm.get('guests')?.value,
      breakfast: this.newHotelForm.get('breakfast')?.value,
      bedType: this.newHotelForm.get('bedType')?.value,
      image: this.newHotelForm.get('images')?.value,
      images: this.files,
      moreInfo: this.newHotelForm.get('moreInfo')?.value,
      cancelation: this.newHotelForm.get('cancelation')?.value,
      price: this.newHotelForm.get('price')?.value
    }
    this.myObservable = this.Shotel.addHotel(this.NewHotel)
    this.openSnackBar("Hotel Added!")
  }
  else{
    this.openSnackBar("Something went wrong, please check your input and try again")
  }

  }

  ngOnDestroy():void {
    this.myObservable?.unsubscribe()
  }
}
