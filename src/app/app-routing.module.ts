import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'homepage',
    loadChildren: () => import('./modules/shared/homepage/homepage.module').then(m => m.HomepageModule)
  },
  {
    path: 'add-hotel',
    loadChildren: () => import('./modules/all_modules/add-new-hotel/add-new-hotel.module').then(m => m.AddNewHotelModule)
  },
  {
    path: 'choose-hotel',
    loadChildren: () => import('./modules/all_modules/choose-hotel/choose-hotel.module').then(m => m.ChooseHotelModule)
  },
  {
    path: 'add-flight',
    loadChildren: () => import('./modules/all_modules/add-new-flight/add-new-flight.module').then(m => m.AddNewFlightModule)
  },
  {
    path: 'choose-flight',
    loadChildren: () => import('./modules/all_modules/choose-flight/choose-flight.module').then(m => m.ChooseFlightModule)
  },
  {
    path: 'preview',
    loadChildren: () => import('./modules/all_modules/preview/preview.module').then(m => m.PreviewModule)
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
    loadChildren: () => import('./modules/all_modules/final-order/final-order.module').then(m => m.FinalOrderModule)
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
