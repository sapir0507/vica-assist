import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddNewFlightModule } from './modules/all_modules/add-new-flight/add-new-flight.module';
import { AddNewHotelModule } from './modules/all_modules/add-new-hotel/add-new-hotel.module';
import { ChooseFlightModule } from './modules/all_modules/choose-flight/choose-flight.module';
import { ChooseHotelModule } from './modules/all_modules/choose-hotel/choose-hotel.module';
import { HeaderModule } from './modules/shared/header/header.module';

import { environment } from '../environments/environment';
import { JwtModule, JwtModuleOptions } from '@auth0/angular-jwt';
import { SflightService } from './services/flight/sflight.service';
import { API_URL } from '@vica-assist/shared';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserFinishedOrderModule } from './modules/all_modules/user-finished-order/user-finished-order.module';




const JWT_Module_Options: JwtModuleOptions = {
  config: {
      tokenGetter: undefined
  }
};


@NgModule({
  declarations: [
    AppComponent
    
  ],
  imports: [
     BrowserModule,
     NgbModule,
    // HomepageModule,
     HeaderModule,
     ChooseFlightModule,
     ChooseHotelModule,
     AddNewFlightModule,
     AddNewHotelModule,
     AppRoutingModule,
     ReactiveFormsModule,
     HttpClientModule,
    MatSliderModule,
    JwtModule.forRoot(JWT_Module_Options),
    
    BrowserAnimationsModule,
    NgbModule
  ],
  providers: [
    SflightService,
    { provide: API_URL, useValue: environment.api }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
