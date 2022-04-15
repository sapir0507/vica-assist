import { Component, Input, OnInit } from '@angular/core';
import { ILinks } from 'src/app/services/links/links';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Input() currentLinks: Array<ILinks> | null = null;
  constructor() { }

  ngOnInit(): void {
  }

}
