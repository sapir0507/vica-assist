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
import { HeaderModule } from './modules/shared/header/header.module';

import { environment } from '../environments/environment';
import { JwtModule, JwtModuleOptions } from '@auth0/angular-jwt';
import { SessionQuery } from './services/session/session.query';
import { SessionStore } from './services/session/session.store';
import { SflightService } from './services/flight/sflight.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { NG_ENTITY_SERVICE_CONFIG } from '@datorama/akita-ng-entity-service';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { MatSliderModule } from '@angular/material/slider';
import { ShotelService } from './services/hotel/shotel.service';
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
    HomepageModule,
    HeaderModule,
    FinalOrderModule,
    ChooseFlightModule,
    ChooseHotelModule,
    AddNewFlightModule,
    AddNewHotelModule,
    AppRoutingModule,
    ReactiveFormsModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule,
    HttpClientModule,
    MatSliderModule,
    JwtModule.forRoot(JWT_Module_Options),
    
    BrowserAnimationsModule,
    NgbModule
  ],
  providers: [
    { provide: 
      NG_ENTITY_SERVICE_CONFIG, 
      useValue: { baseUrl: 'https://jsonplaceholder.typicode.com' }

    },
    SessionQuery,
    SessionStore,
    SflightService,
    ShotelService
    
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
