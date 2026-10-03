import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss', 
    '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
  ]
})
export class AppComponent {
  title = 'vica-assist';
}
