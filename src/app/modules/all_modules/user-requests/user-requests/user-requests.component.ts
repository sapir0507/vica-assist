import { Component, OnInit, ChangeDetectionStrategy, effect, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { activeOptions, collapseSpaces, ConfigService, dateRangeValidator, fullName, israeliId, knownPlace, notInPastValidator, OrderRequest, passDetails, PreferencesFormValue, toPreferences, uniqueTravelerIds } from '@vica-assist/shared';
import { DESTINATIONS, Destination } from 'src/app/modules/shared/destinations/destinations';
import { differentPlaces, maxTrimmed, notBlank, roomsFitTravelers } from '../validators';

const DEFAULT_PREFERENCES = {
  flight: { stops: 'max2', maxLayoverHours: null, checkedBaggage: false, cabin: 'economy', departureTime: 'any', preferredAirlines: [] as string[], flexibleDays: 0 },
  hotel: { breakfast: false, bedType: 'any', freeCancellation: false, rooms: 1, area: 'any' },
  needs: { meal: 'none', seat: 'any', wheelchairAssistance: false },
  notes: ''
};

@Component({
  standalone: false,
  selector: 'userRequests',
  templateUrl: './user-requests.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./user-requests.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestsComponent implements OnInit {

  readonly steps = ['Destination', 'Travelers', 'Trip details', 'Preferences'];
  readonly destinations = DESTINATIONS;
  step = 0;
  orderID: string | null = null;
  private configService = inject(ConfigService);
  private limits = this.configService.config().limits;
  requestForm: FormGroup = this.fb.group({

    //do you want a hotel only or a flight too
    order:this.fb.control('both', [Validators.required, Validators.pattern('[a-zA-Z ]*')]),
    //details
    origin: this.fb.control('', [Validators.required, notBlank, knownPlace]),
    destination: this.fb.control('', [Validators.required, notBlank, knownPlace]),
    passDetails: this.fb.array([] as passDetails[], [Validators.required, uniqueTravelerIds('passID')]),
    Dates: new FormGroup({
      departureDate: this.fb.control('', [Validators.required, notInPastValidator()]),
      returnDate: this.fb.control('', [Validators.required])
    }, { validators: dateRangeValidator('departureDate', 'returnDate') }),

    hotel: this.fb.group({
      stars: this.fb.control<number | null>(3),
    }),
    price: this.fb.control('0', [Validators.required, Validators.min(1)]),

    preferences: this.fb.group({
      flight: this.fb.group({
        stops: this.fb.control('max2'),
        maxLayoverHours: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(this.limits.maxLayoverHours)]),
        checkedBaggage: this.fb.control(false),
        cabin: this.fb.control('economy'),
        departureTime: this.fb.control('any'),
        preferredAirlines: this.fb.control<string[]>([]),
        flexibleDays: this.fb.control(0, [Validators.min(0), Validators.max(this.limits.maxFlexibleDays)])
      }),
      hotel: this.fb.group({
        breakfast: this.fb.control(false),
        bedType: this.fb.control('any'),
        freeCancellation: this.fb.control(false),
        rooms: this.fb.control(1, [Validators.required, Validators.min(1), Validators.max(this.limits.maxRooms)]),
        area: this.fb.control('any')
      }),
      needs: this.fb.group({
        meal: this.fb.control('none'),
        seat: this.fb.control('any'),
        wheelchairAssistance: this.fb.control(false)
      }),
      notes: this.fb.control('', [maxTrimmed(this.limits.notesMaxLength)])
    })

  }, { validators: [differentPlaces('origin', 'destination'), roomsFitTravelers] })

  get order(){
    return this.requestForm.get('order')?.value as string;
  }

  get Dates(){
    return this.requestForm.get('Dates') as FormGroup;
  }
  get departureDate(){
    return this.Dates.get('departureDate') as FormControl;
  }
  get returnDate(){
    return this.Dates.get('returnDate') as FormControl;
  }

  get hotel(){
    return this.requestForm.get('hotel') as FormGroup;
  }

  get stars(){
    return this.hotel.get('stars') as FormControl;
  }

  get passDetails(): FormArray{
    return (this.requestForm.controls['passDetails']) as FormArray;
  }

  private orderStore = inject(OrderStore);
  private sessionStore = inject(SessionStore);

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) {
      this.addNewPass()

      effect(() => {
        const orders = this.orderStore.orders();
        if(orders) this.orderID = '' + (orders.length + 1) //*
      });
    }

  ngOnInit(): void {/* empty*/}

  get canContinue(): boolean {
    const controls = this.requestForm.controls;
    if (this.step === 0) return controls['destination'].valid;
    if (this.step === 1) return this.passDetails.valid;
    if (this.step === 2) {
      return controls['origin'].valid && controls['price'].valid && this.Dates.valid && !this.requestForm.hasError('samePlace');
    }
    return true;
  }

  get flightIncluded(): boolean {
    return this.order !== 'hotel';
  }

  get preferenceForm(): FormGroup {
    return this.requestForm.controls['preferences'] as FormGroup;
  }

  get notesLength(): number {
    return String(this.preferenceForm.get('notes')?.value ?? '').trim().length;
  }

  get notesMax(): number {
    return this.limits.notesMaxLength;
  }

  get maxFlexibleDays(): number {
    return this.limits.maxFlexibleDays;
  }

  get maxLayoverHours(): number {
    return this.limits.maxLayoverHours;
  }

  get maxRooms(): number {
    return Math.min(this.limits.maxRooms, Math.max(this.passDetails.length, 1));
  }

  get options() {
    const config = this.configService.config();
    return {
      stops: activeOptions(config.stopsOptions),
      cabins: activeOptions(config.cabins),
      departureTimes: activeOptions(config.departureTimes),
      bedTypes: activeOptions(config.bedTypes),
      hotelAreas: activeOptions(config.hotelAreas),
      meals: activeOptions(config.meals),
      seatTypes: activeOptions(config.seatTypes),
      airlines: config.airlines.filter(airline => airline.active)
    };
  }

  isPreferredAirline(id: string): boolean {
    return (this.preferenceForm.get('flight.preferredAirlines')?.value as string[]).includes(id);
  }

  togglePreferredAirline(id: string): void {
    const control = this.preferenceForm.get('flight.preferredAirlines');
    const chosen = control?.value as string[];
    control?.setValue(chosen.includes(id) ? chosen.filter(item => item !== id) : [...chosen, id]);
  }

  isSelected(destination: Destination): boolean {
    return this.requestForm.value.destination?.trim().toLowerCase() === destination.name.toLowerCase();
  }

  selectDestination(destination: Destination) {
    this.requestForm.patchValue({ destination: destination.name });
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  get canAddTraveler(): boolean {
    return this.passDetails.length < this.limits.maxTravelers;
  }

  get originControl(): FormControl {
    return this.requestForm.controls['origin'] as FormControl;
  }

  get destinationControl(): FormControl {
    return this.requestForm.controls['destination'] as FormControl;
  }

  get hotelIncluded(): boolean {
    return this.order !== 'flight';
  }

  addNewPass(): void{
    if (!this.canAddTraveler) return;
    const newPass: FormGroup = this.fb.group({
      fullName: this.fb.control('', [Validators.required, notBlank, fullName(this.limits.nameMaxLength)]),
      passID: this.fb.control('', [Validators.required, israeliId])
    })
    this.passDetails.push(newPass)
  }

  deleteExistingPass(i: number){
    this.passDetails.removeAt(i)
  }


  onSubmit(){
    if(this.requestForm.valid) {
      this.orderID = this.orderID? this.orderID : '1';
      const newOrder: OrderRequest = {
        choice: this.order,
        orderID: this.orderID,
        status: 'pending',
        departureDate: this.Dates.get('departureDate')?.value,
        returnDate: this.Dates.get('returnDate')?.value,
        origin: this.requestForm.get('origin')?.value.trim(),
        destination: this.requestForm.get('destination')?.value.trim(),
        passDetails: (this.requestForm.get('passDetails')?.value as { fullName: string; passID: string }[]).map(traveler => ({
          fullName: collapseSpaces(traveler.fullName),
          passID: Number(traveler.passID)
        })),
        stars: this.hotelIncluded ? this.hotel.get('stars')?.value : undefined,
        preferences: toPreferences(this.order, this.preferenceForm.value as PreferencesFormValue),
        priceRange: this.requestForm.get('price')?.value,
        customer: this.sessionStore.username(),
        createdAt: new Date().toISOString()
      }
    console.log(newOrder)
    this.orderStore.addOrder(newOrder);
    this.openSnackBar("Order added!")
    this.requestForm.reset({ order: 'both', price: '0', hotel: { stars: 3 }, preferences: structuredClone(DEFAULT_PREFERENCES) });
    this.step = 0;
  }
  }

  openSnackBar(message: string) {
    this._snackBar.open(message);
  }

}
