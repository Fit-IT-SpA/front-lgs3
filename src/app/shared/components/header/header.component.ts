import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavService } from '../../services/nav.service';
import { LayoutService } from '../../services/layout.service';
import { ConstantService } from '../../services/constant.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public elem: any;
  public dark: boolean = this.layout.config.settings.layout_version == 'dark-only' ? true : false;
  public addOrderButtonDesktopDisabled: boolean = true;
  public addOrderButtonMobileDisabled: boolean = true;
  public profile =  JSON.parse(localStorage.getItem('profile'));

  constructor(public layout: LayoutService,
    public navServices: NavService, 
    private router: Router,
    @Inject(DOCUMENT) private document: any
  ) {
    if (window.innerWidth < 575) {
      this.addOrderButtonDesktopDisabled = false;
      this.addOrderButtonMobileDisabled = true;
    } else {
      this.addOrderButtonDesktopDisabled = true;
      this.addOrderButtonMobileDisabled = false;
    }
  }
  @HostListener('window:resize', ['$event'])
    onWindowResize(event: any) {
      //console.log('Resolución actual: ' + window.innerWidth + ' x ' + window.innerHeight);
      if (window.innerWidth < 575) {
        this.addOrderButtonDesktopDisabled = false;
        this.addOrderButtonMobileDisabled = true;
      } else {
        this.addOrderButtonDesktopDisabled = true;
        this.addOrderButtonMobileDisabled = false;
      }
    }
  ngOnInit() {
    this.elem = document.documentElement;
  }

  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
    this.navServices.megaMenu  = false;
    this.navServices.levelMenu = false;
  }

  layoutToggle() {
    this.dark = !this.dark;
    this.layout.config.settings.layout_version = this.dark ? 'dark-only' : 'light';
  }

  searchToggle() {
    this.navServices.search = true;
  }

  languageToggle() {
    this.navServices.language = !this.navServices.language;
  }

  toggleFullScreen() {
    this.navServices.fullScreen = !this.navServices.fullScreen;
    if (this.navServices.fullScreen) {
      if (this.elem.requestFullscreen) {
        this.elem.requestFullscreen();
      } else if (this.elem.mozRequestFullScreen) {
        /* Firefox */
        this.elem.mozRequestFullScreen();
      } else if (this.elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.elem.webkitRequestFullscreen();
      } else if (this.elem.msRequestFullscreen) {
        /* IE/Edge */
        this.elem.msRequestFullscreen();
      }
    } else {
      if (!this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }
  public haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
    let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_CAJA_LECTURA;
    });
    return access.length > 0;
    } else {
    return false;
    }
}
  goToAddOrder() {
    this.router.navigate(['/admin/orders/add']);
  }


}
