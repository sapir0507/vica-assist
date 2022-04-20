import { Component, Input, OnInit } from '@angular/core';
import { ILinks } from 'src/app/services/links/links';
import { LinksService } from 'src/app/services/links/links.service';



@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss']
})
export class LinksComponent implements OnInit {
  @Input() currentLinks: Array<ILinks> | null = null;
  @Input() customersLinks: Array<ILinks> | null = null;
  @Input() agentsLinks: Array<ILinks> | null = null;
  @Input() sharedLinks: Array<ILinks> | null = null;

  @Input() isDropDown: boolean | null = null;
  @Input() isSideBar: boolean | null = null;
 
  constructor(private SLinks: LinksService) { 
    this.sharedLinks = SLinks.getLinks('shared');
    this.customersLinks = SLinks.getLinks('customer');
    this.agentsLinks = SLinks.getLinks('agent');
  }

  ngOnInit(): void {
    // console.log("links component")
    // console.log("current links: ", this.currentLinks)
    // console.log("isSideBar: ", this.isSideBar)
    // console.log("isDropDown", this.isDropDown)
  }

}
