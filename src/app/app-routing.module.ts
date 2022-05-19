import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { 
  AuthGuardService as AuthGuard 
} from './services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: 'homepage',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/shared/homepage/homepage.module').then(m => m.HomepageModule)
  },
  {
    path: 'add-hotel',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/all_modules/add-new-hotel/add-new-hotel.module').then(m => m.AddNewHotelModule)
  },
  {
    path: 'choose-hotel',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/all_modules/choose-hotel/choose-hotel.module').then(m => m.ChooseHotelModule)
  },
  {
    path: 'add-flight',
     canActivate: [AuthGuard],
    loadChildren: () => import('./modules/all_modules/add-new-flight/add-new-flight.module').then(m => m.AddNewFlightModule)
  },
  {
    path: 'choose-flight',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/all_modules/choose-flight/choose-flight.module').then(m => m.ChooseFlightModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/shared/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./modules/shared/register/register.module').then(m => m.RegisterModule)
  },
  {
    path: 'final-order',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/all_modules/final-order/final-order.module').then(m => m.FinalOrderModule)
  },
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
