import { Component, Input, OnInit } from '@angular/core';
import { ILinks } from 'src/app/services/links/links';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  @Input() currentLinks: Array<ILinks> | null = null;
  @Input() title: string | null = null;
  @Input() isDropDown: boolean | null = null;
  @Input() isSideBar: boolean | null = null;
  constructor() { }

  ngOnInit(): void {
    // console.log("dropdown component")
    // console.log("current links", this.currentLinks)
    // console.log("isSideBar", this.isSideBar)
    // console.log("isDropDown", this.isDropDown)
  }

}
