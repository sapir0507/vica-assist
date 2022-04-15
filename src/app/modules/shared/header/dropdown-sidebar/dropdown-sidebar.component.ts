import { Component, Input, OnInit } from '@angular/core';
import { ILinks } from 'src/app/services/links/links';
import { LinksService } from 'src/app/services/links/links.service';

@Component({
  selector: 'app-dropdown-sidebar',
  templateUrl: './dropdown-sidebar.component.html',
  styleUrls: ['./dropdown-sidebar.component.scss']
})
export class DropdownSidebarComponent implements OnInit {
  @Input() currentLinks: Array<ILinks> | null = null;
  @Input() customersLinks: Array<ILinks> | null = null;
  @Input() agentsLinks: Array<ILinks> | null = null;
  @Input() sharedLinks: Array<ILinks> | null = null;
  constructor(private SLinks: LinksService) {
    this.sharedLinks = SLinks.getLinks('shared');
    this.customersLinks = SLinks.getLinks('customer');
    this.agentsLinks = SLinks.getLinks('agent');
  }

  ngOnInit(): void {
   
  }

}
