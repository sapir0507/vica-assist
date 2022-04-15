import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddNewFlightModule } from './modules/all_modules/add-new-flight/add-new-flight.module';
import { AddNewHotelModule } from './modules/all_modules/add-new-hotel/add-new-hotel.module';
import { ChooseFlightModule } from './modules/all_modules/choose-flight/choose-flight.module';
import { ChooseHotelModule } from './modules/all_modules/choose-hotel/choose-hotel.module';
import { FinalOrderModule } from './modules/all_modules/final-order/final-order.module';
import { HomepageModule } from './modules/shared/homepage/homepage.module';
import { PreviewModule } from './modules/all_modules/preview/preview.module';

import { FooterModule } from './modules/shared/footer/footer.module';
import { HeaderModule } from './modules/shared/header/header.module';


@NgModule({
  declarations: [
    AppComponent
    
  ],
  imports: [
    BrowserModule,
    HomepageModule,
    HeaderModule,
    FinalOrderModule,
    FooterModule,
    ChooseFlightModule,
    ChooseHotelModule,
    AddNewFlightModule,
    AddNewHotelModule,
    PreviewModule,
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
