import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, observable, Subject ,Observable, Observer, Subscription, of, fromEvent } from 'rxjs';
import { ILinks } from 'src/app/services/links/links';
import { LinksService } from 'src/app/services/links/links.service';
import { OnWindowResizeService } from 'src/app/services/onWindowResize/on-window-resize.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() navbarComponentIs: number = window.innerWidth < 800? 1 : 2;
  resize: Subscription;
  currentLinks: Array<ILinks>;
  ngOnInit() {
    this.navbarComponentIs = 1;
  }

  constructor(private SLinks: LinksService, private onResize: OnWindowResizeService) { 
    // const resize = fromEvent(window, 'resize');  
    // resize
    // .pipe(debounceTime(300))
    // .subscribe(x => {
    //   console.log(x, "inner width: ", window.innerWidth)
    //   if(window.innerWidth < 800) this.navbarComponentIs = 1
    //   else this.navbarComponentIs = 2());
    this.resize = onResize.monitor_resizing(this.navbarComponentIs)
    console.log(this.resize)
    this.currentLinks = SLinks.getLinks('shared');
    // console.log('current Links: ',this.currentLinks)
  }

  OnLogin(){
    //if agent
    this.currentLinks = this.SLinks.getLinks('agent').concat(this.SLinks.getLinks('customer'))
  }

  
  ngOnDestroy(): void {
    this.resize.unsubscribe()
  }
  

  

  
}
