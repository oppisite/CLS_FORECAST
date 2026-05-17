import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { environment } from 'src/environments/environment';

import { UserProfileService } from 'src/app/core/services/user.service';
import { MenuService } from 'src/app/core/services/menu.service';
import { SessionService } from 'src/app/core/services/session.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  menu: any;
  user: any;
  toggle: any = true;
  menuItems: MenuItem[] = [];
  environment = environment; // เพิ่ม environment property
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  constructor(
    private router: Router, 
    public translate: TranslateService,
    private userService: UserProfileService,
    private menuService: MenuService,
    private sessionService: SessionService
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    // ตรวจสอบ session expiration ก่อน
    this.checkSessionExpiration();
    
    // โหลด menu จาก session ก่อน
    this.loadMenuFromSession();
    
    // Debug: แสดงข้อมูล menu ที่โหลด
    console.log('Sidebar ngOnInit - Current menuItems:', this.menuItems);
    
    // ใช้ combineLatest เพื่อรอทั้ง user และ menu
    combineLatest([
      this.userService.currentUser,
      this.menuService.menuItems
    ]).pipe(
      map(([user, menuItems]) => ({ user, menuItems }))
    ).subscribe(({ user, menuItems }) => {
      // ถ้าไม่มี menu ใน session ให้ใช้จาก menuService
      if (!this.menuItems || this.menuItems.length === 0) {
        console.log('No menu from session, using menuService items:', menuItems);
        this.menuItems = menuItems;
      } else {
        console.log('Using menu from session, ignoring menuService items');
      }
    });

    // โหลด menu จาก API เมื่อมีข้อมูลผู้ใช้และไม่มี menu ใน session
    this.userService.currentUser.subscribe(user => {
      if (user && (!this.menuItems || this.menuItems.length === 0)) {
        console.log('Loading menu from API for user:', user);
        this.loadMenuFromAPI(user.permission || 1);
      }
    });

    this.router.events.subscribe((event) => {
      if (document.documentElement.getAttribute('data-layout') != "twocolumn") {
        if (event instanceof NavigationEnd) {
          this.initActiveMenu();
        }
      }
    });
  }

  /**
   * โหลด menu จาก session
   */
  private loadMenuFromSession(): void {
    // ตรวจสอบว่ามี session ที่ถูกต้องหรือไม่
    if (this.sessionService.hasValidSession()) {
      const session = this.sessionService.getUserSession();
      if (session && session.menuData && session.menuData.length > 0) {
        console.log('Loading menu from session:', session.menuData);
        this.menuItems = session.menuData;
        // อัปเดต menuService ด้วย
        this.menuService.updateMenuItems(session.menuData);
        return;
      }
    }

    // ถ้าไม่มี menu ใน session ให้ใช้ menu เริ่มต้นจากไฟล์ MENU
    console.log('No valid menu in session, using default MENU');
    // this.menuItems = MENU;
    // this.menuService.updateMenuItems(MENU);
  }

  /**
   * โหลด menu จาก API
   */
  private loadMenuFromAPI(permission: number) {
    this.menuService.loadMenuByPermission(permission).subscribe({
      next: (response) => {
        if (response && response.menuItems) {
          this.menuService.updateMenuItems(response.menuItems);
          this.menuItems = response.menuItems;
        }
      },
      error: (error) => {
        console.error('Error loading menu from API:', error);
        // Fallback ไปใช้ menu จากไฟล์ local
        console.log('API error, using default MENU as fallback');
        // this.menuItems = MENU;
        // this.menuService.updateMenuItems(MENU);
      }
    });
  }

  /**
   * Refresh menu จาก session
   */
  refreshMenuFromSession(): void {
    console.log('Refreshing menu from session...');
    this.loadMenuFromSession();
  }

  /**
   * ตรวจสอบและจัดการ session expiration
   */
  private checkSessionExpiration(): void {
    if (!this.sessionService.hasValidSession()) {
      console.log('Session expired, clearing session and redirecting to login');
      this.sessionService.clearSession();
      this.router.navigate(['/account/signin']);
    }
  }

  /**
   * อัปเดต menu ใน session
   */
  updateMenuInSession(menuItems: MenuItem[]): void {
    this.sessionService.updateSession({ menuData: menuItems });
    this.menuItems = menuItems;
    this.menuService.updateMenuItems(menuItems);
  }

  /**
   * Debug function - แสดงข้อมูล session
   */
  debugSession(): void {
    console.log('=== Session Debug Info ===');
    console.log('Has valid session:', this.sessionService.hasValidSession());
    console.log('Has menu data:', this.sessionService.hasMenuData());
    console.log('Has permission data:', this.sessionService.hasPermissionData());
    console.log('Has token:', this.sessionService.hasToken());
    
    const session = this.sessionService.getUserSession();
    if (session) {
      console.log('Session data:', session);
      console.log('Menu items count:', session.menuData ? session.menuData.length : 0);
    } else {
      console.log('No session found');
    }
    console.log('Current menu items:', this.menuItems);
    console.log('========================');
  }

  /**
   * Force refresh menu จาก session
   */
  forceRefreshMenu(): void {
    console.log('Force refreshing menu from session...');
    this.menuService.refreshMenuFromSession();
    this.loadMenuFromSession();
  }

  /**
   * Clear session และ reload menu
   */
  clearSessionAndReload(): void {
    console.log('Clearing session and reloading menu...');
    this.sessionService.clearSession();
    this.loadMenuFromSession();
    console.log('Session cleared, menuItems:', this.menuItems);
  }

  /**
   * Test function - สร้าง test menu data
   */
  createTestMenuData(): void {
    const testMenuItems: MenuItem[] = [
      {
        id: 1,
        label: 'Test Menu 1',
        icon: 'bx bx-home-alt',
        link: '/test1',
        isTitle: false,
        isLayout: false
      },
      {
        id: 2,
        label: 'Test Menu 2',
        icon: 'bx bx-menu',
        link: '/test2',
        isTitle: false,
        isLayout: false
      }
    ];
    
    console.log('Creating test menu data:', testMenuItems);
    this.updateMenuInSession(testMenuItems);
  }

  /**
   * Test function - ใช้ default MENU
   */
  useDefaultMenu(): void {
    // console.log('Using default MENU:', MENU);
    // this.menuItems = MENU;
    // this.menuService.updateMenuItems(MENU);
  }

  /**
   * Test function - ตรวจสอบ sidebar state
   */
  checkSidebarState(): void {
    console.log('=== Sidebar State Check ===');
    console.log('menuItems length:', this.menuItems.length);
    console.log('menuItems:', this.menuItems);
    console.log('Has session:', this.sessionService.hasValidSession());
    console.log('Session data:', this.sessionService.getUserSession());
    console.log('Current URL:', window.location.pathname);
    console.log('========================');
  }

  /**
   * Test function - ตรวจสอบ session storage
   */
  checkSessionStorage(): void {
    console.log('=== Session Storage Check ===');
    console.log('userSession:', sessionStorage.getItem('userSession'));
    console.log('sidebarMenu:', sessionStorage.getItem('sidebarMenu'));
    console.log('selectedPermission:', sessionStorage.getItem('selectedPermission'));
    console.log('authToken:', sessionStorage.getItem('authToken'));
    console.log('========================');
  }

  /**
   * Test function - ตรวจสอบ menu service
   */
  checkMenuService(): void {
    console.log('=== Menu Service Check ===');
    console.log('Menu service menuItems:', this.menuService.getCurrentMenuItems());
    console.log('Has menu in session:', this.menuService.hasMenuInSession());
    console.log('========================');
  }
  /***
   * Activate droup down set
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.initActiveMenu();
    }, 0);
  }


  removeActivation(items: any) {
    items.forEach((item: any) => {
      item.classList.remove("active");
    });
  }

  
  toggleItem(item: any) {
    this.menuItems.forEach((menuItem: any) => {

      if (menuItem == item) {
        menuItem.isCollapsed = !menuItem.isCollapsed
      } else {
        menuItem.isCollapsed = true
      }
      if (menuItem.subItems) {
        menuItem.subItems.forEach((subItem: any) => {

          if (subItem == item) {
            menuItem.isCollapsed = !menuItem.isCollapsed
            subItem.isCollapsed = !subItem.isCollapsed
          } else {
            subItem.isCollapsed = true
          }
          if (subItem.subItems) {
            subItem.subItems.forEach((childitem: any) => {

              if (childitem == item) {
                childitem.isCollapsed = !childitem.isCollapsed
                subItem.isCollapsed = !subItem.isCollapsed
                menuItem.isCollapsed = !menuItem.isCollapsed
              } else {
                childitem.isCollapsed = true
              }
              if (childitem.subItems) {
                childitem.subItems.forEach((childrenitem: any) => {

                  if (childrenitem == item) {
                    childrenitem.isCollapsed = false
                    childitem.isCollapsed = false
                    subItem.isCollapsed = false
                    menuItem.isCollapsed = false
                  } else {
                    childrenitem.isCollapsed = true
                  }
                })
              }
            })
          }
        })
      }
    });
  }


  // remove active items of two-column-menu
  activateParentDropdown(item: any) {
    item.classList.add("active");
    let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      // to set aria expand true remaining
      parentCollapseDiv.classList.add("show");
      parentCollapseDiv.parentElement.children[0].classList.add("active");
      parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
      if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
        parentCollapseDiv.parentElement.closest(".collapse").classList.add("show");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").classList.add("show");
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").previousElementSibling.classList.add("active");
        }
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    let pathName = window.location.pathname;
    // Check if the application is running in production
    if (environment.production) {
      // Modify pathName for production build
      pathName = pathName.replace('/velzon/angular/modern', '');
    }

    const active = this.findMenuItem(pathName, this.menuItems)
    this.toggleItem(active)
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      let activeItems = items.filter((x: any) => x.classList.contains("active"));
      this.removeActivation(activeItems);

      let matchingMenuItem = items.find((x: any) => {
        if (environment.production) {
          let path = x.pathname
          path = path.replace('/velzon/angular/modern', '');
          return path === pathName;
        } else {
          return x.pathname === pathName;
        }

      });
      if (matchingMenuItem) {
        this.activateParentDropdown(matchingMenuItem);
      }
    }
  }
  private findMenuItem(pathname: string, menuItems: any[]): any {
    for (const menuItem of menuItems) {
      if (menuItem.link && menuItem.link === pathname) {
        return menuItem;
      }

      if (menuItem.subItems) {
        const foundItem = this.findMenuItem(pathname, menuItem.subItems);
        if (foundItem) {
          return foundItem;
        }
      }
    }

    return null;
  }
  
  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    var sidebarsize = document.documentElement.getAttribute("data-sidebar-size");
    if (sidebarsize == 'sm-hover-active') {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover')
    } else {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover-active')
    }
  }

  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    document.body.classList.remove('vertical-sidebar-enable');
  }

}
