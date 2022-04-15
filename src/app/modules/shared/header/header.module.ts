import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderRoutingModule } from './header-routing.module';
import { HeaderComponent } from './header.component';
import { DropdownSidebarComponent } from './dropdown-sidebar/dropdown-sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LinksComponent } from './links/links.component';
import { DropdownComponent } from './dropdown-sidebar/dropdown/dropdown.component';


@NgModule({
  declarations: [
    HeaderComponent,
    DropdownSidebarComponent,
    LinksComponent,
    NavbarComponent,
    DropdownComponent
    
  ],
  imports: [
    CommonModule,
    HeaderRoutingModule
  ],
  exports:[
    HeaderComponent
  ]
})
export class HeaderModule { }
