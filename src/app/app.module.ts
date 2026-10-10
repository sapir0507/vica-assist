import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderModule } from './modules/shared/header/header.module';

import { environment } from '../environments/environment';
import { JwtModule, JwtModuleOptions } from '@auth0/angular-jwt';
import { SflightService } from './services/flight/sflight.service';
import { API_URL, provideAppIcons } from '@vica-assist/shared';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';




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
     AppRoutingModule,
     ReactiveFormsModule,
     HttpClientModule,
    JwtModule.forRoot(JWT_Module_Options),
    
    BrowserAnimationsModule,
    NgbModule
  ],
  providers: [
    SflightService,
    { provide: API_URL, useValue: environment.api },
    provideAppIcons()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
