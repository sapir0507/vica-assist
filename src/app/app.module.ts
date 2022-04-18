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
import { NG_ENTITY_SERVICE_CONFIG } from '@datorama/akita-ng-entity-service';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';
import { JwtModule, JwtModuleOptions } from '@auth0/angular-jwt';
import { SessionQuery } from './services/session/session.query';
import { SessionStore } from './services/session/session.store';
import { SflightService } from './services/flight/sflight.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule,
    HttpClientModule,
    
    JwtModule.forRoot(JWT_Module_Options),
    
    BrowserAnimationsModule
  ],
  providers: [
    { provide: 
      NG_ENTITY_SERVICE_CONFIG, 
      useValue: { baseUrl: 'https://jsonplaceholder.typicode.com' }

    },
    SessionQuery,
    SessionStore,
    SflightService,
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
