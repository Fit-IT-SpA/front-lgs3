import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Menu, NavService } from '../../services/nav.service';
import { LayoutService } from '../../services/layout.service';
import { Session } from '../../model/session';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {

  public iconSidebar;
  public menuItems: Menu[];
  public menuPrivilageItems: Menu[] = [];
  public url: any;
  public fileurl: any;

  // For Horizontal Menu
  public margin: any = 0;
  public width: any = window.innerWidth;
  public leftArrowNone: boolean = true;
  public rightArrowNone: boolean = false;
  public profile: Session = JSON.parse(localStorage.getItem("profile"));

  constructor(private router: Router, public navServices: NavService,
    public layout: LayoutService) {
    this.navServices.items.subscribe(menuItems => {
      this.menuItems = menuItems;
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          menuItems.filter(items => {
            if (items.path === event.url) {
              this.setNavActive(items);
            }
            if (!items.children) { return false; }
            items.children.filter(subItems => {
              if (subItems.path === event.url) {
                this.setNavActive(subItems);
              }
              if (!subItems.children) { return false; }
              subItems.children.filter(subSubItems => {
                if (subSubItems.path === event.url) {
                  this.setNavActive(subSubItems);
                }
              });
            });
          });
        }
      });
    });
    this.menuPrivilageItems = this.menuItems;
    //this.privilageMenu();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.width = event.target.innerWidth - 500;
  }

  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
  }

  // Active Nave state
  setNavActive(item) {
    this.menuItems.filter(menuItem => {
      if (menuItem !== item) {
        menuItem.active = false;
      }
      if (menuItem.children && menuItem.children.includes(item)) {
        menuItem.active = true;
      }
      if (menuItem.children) {
        menuItem.children.filter(submenuItems => {
          if (submenuItems.children && submenuItems.children.includes(item)) {
            menuItem.active = true;
            submenuItems.active = true;
          }
        });
      }
    });
  }

  // Click Toggle menu
  toggletNavActive(item) {
    if (!item.active) {
      this.menuItems.forEach(a => {
        if (this.menuItems.includes(item)) {
          a.active = false;
        }
        if (!a.children) { return false; }
        a.children.forEach(b => {
          if (a.children.includes(item)) {
            b.active = false;
          }
        });
      });
    }
    item.active = !item.active;
  }


  // For Horizontal Menu
  scrollToLeft() {
    if (this.margin >= -this.width) {
      this.margin = 0;
      this.leftArrowNone = true;
      this.rightArrowNone = false;
    } else {
      this.margin += this.width;
      this.rightArrowNone = false;
    }
  }

  scrollToRight() {
    if (this.margin <= -3051) {
      this.margin = -3464;
      this.leftArrowNone = false;
      this.rightArrowNone = true;
    } else {
      this.margin += -this.width;
      this.leftArrowNone = false;
    }
  }
  /**
   * Función que crea menu con los privilegios del usuario
   */
  private privilageMenu() {
    for (let menuItem of this.menuItems) {
      let menu: Menu = null;
      for (let privilage of this.profile.privilege) {
        if (menuItem.id && menuItem.id == privilage || menuItem.id == 'menu') {
          // Creación de un menu
          menu = {
            id: (menuItem.id) ? menuItem.id : null,
            headTitle1: (menuItem.headTitle1) ? menuItem.headTitle1 : null,
            headTitle2: (menuItem.headTitle2) ? menuItem.headTitle2 : null,
            path: (menuItem.path) ? menuItem.path : null,
            title: (menuItem.title) ? menuItem.title : null,
            icon: (menuItem.icon) ? menuItem.icon : null,
            type: (menuItem.type) ? menuItem.type : null,
            badgeType: (menuItem.badgeType) ? menuItem.badgeType : null,
            badgeValue: (menuItem.badgeValue) ? menuItem.badgeValue : null,
            active: (menuItem.active) ? menuItem.active : null,
            bookmark: (menuItem.bookmark) ? menuItem.bookmark : null,
            children: (menuItem.children) ? [] : null
          }
        }
      }
      if (menuItem.children) {
        for (let subMenuItem of menuItem.children) {
          for (let privilage of this.profile.privilege) {
            if (subMenuItem.id && subMenuItem.id == privilage || subMenuItem.id == 'menu') {
              // Creación de un sub-menu
              menu.children.push(subMenuItem)
            }
          }
        }
      }
      if (menu) {
        this.menuPrivilageItems.push(menu);
      }
    }
    //console.log(this.menuPrivilageItems);
  }
  

}
