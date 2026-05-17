import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MenuItem } from '../../layouts/sidebar/menu.model';
import { MenuMappingHelper } from '../data/menu-mapping';
import { SessionService } from './session.service';

export interface PermissionGroup {
  IDA: number;
  GroupId: string;
  GroupMenuId: string;
  Activefact: boolean;
  Create_Date: string;
  Create_By: string;
  Update_Date: string;
  Update_By: string;
}

export interface PermissionMenu {
  IDA: number;
  GroupId: string;
  menuId: string;
  Activefact: boolean;
  Create_Date: string;
  Create_By: string;
  Update_Date: string;
  Update_By: string;
}

export interface PermissionSubmenu {
  IDA: number;
  GroupId: string;
  SubmenuId: string;
  Activefact: boolean;
  Create_Date: string;
  Create_By: string;
  Update_Date: string;
  Update_By: string;
}

export interface MenuResponse {
  List_permission_group: PermissionGroup[];
  List_permission_menu: PermissionMenu[];
  List_permission_submenu: PermissionSubmenu[];
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  public menuItems = this.menuItemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) {
    this.loadMenuFromStorage();
  }

  /**
   * โหลด menu จาก API ตาม permission และ token
   */
  getMenuByPermission(permissionId: string, token: string): Observable<MenuItem[]> {
    

    return this.http.post<MenuResponse>(environment.GET_MENU, {
      token: token,
      permission_id: permissionId
    }).pipe(
      map(response => {
        console.log('Raw menu response:', response);
        return this.mapMenuData(response);
      }),
      tap(menuData => {
        console.log('Mapped menu data:', menuData);
        // เก็บ menu ใน session storage
        this.sessionService.storeMenuData(menuData);
        // update subject
        this.menuItemsSubject.next(menuData);
      })
    );
  }

  /**
   * แปลงข้อมูล menu จาก API เป็นรูปแบบที่ใช้ใน sidebar
   * โครงสร้าง: Permission Group -> Menu -> Submenu
   */
  private mapMenuData(response: MenuResponse): MenuItem[] {
    const menuItems: MenuItem[] = [];
    const groupMap = new Map<string, MenuItem>();

    // 1. สร้าง Permission Groups (ระดับสูงสุด)
    response.List_permission_group.forEach(group => {
      if (group.Activefact) {
        const groupItem: MenuItem = {
          id: parseInt(group.GroupId),
          label: this.getGroupLabel(group.GroupId),
          icon: this.getGroupIcon(group.GroupId),
          link: '#', // Group ไม่มี link โดยตรง
          subItems: [],
          isTitle: false,
          isLayout: false
        };
        groupMap.set(group.GroupId, groupItem);
        menuItems.push(groupItem);
      }
    });

    // 2. เพิ่ม Menus ให้กับ Groups
    response.List_permission_menu.forEach(menu => {
      if (menu.Activefact) {
        const menuItem: MenuItem = {
          id: parseInt(menu.menuId),
          label: this.getMenuLabel(menu.menuId),
          icon: this.getMenuIcon(menu.menuId),
          link: this.getMenuLink(menu.menuId),
          subItems: [],
          parentId: parseInt(menu.GroupId), // ระบุ parent group
          isTitle: false,
          isLayout: false
        };

        // หา parent group และเพิ่ม menu
        const parentGroup = groupMap.get(menu.GroupId);
        if (parentGroup) {
          if (!parentGroup.subItems) {
            parentGroup.subItems = [];
          }
          parentGroup.subItems.push(menuItem);
        }
      }
    });

    // 3. เพิ่ม Submenus ให้กับ Menus
    response.List_permission_submenu.forEach(submenu => {
      if (submenu.Activefact) {
        const parentMenuId = parseInt(this.getParentMenuId(submenu.SubmenuId));
        const submenuItem: MenuItem = {
          id: parseInt(submenu.SubmenuId),
          label: this.getSubmenuLabel(submenu.SubmenuId),
          icon: this.getSubmenuIcon(submenu.SubmenuId),
          link: this.getSubmenuLink(submenu.SubmenuId),
          parentId: parentMenuId, // ระบุ parent menu
          isTitle: false,
          isLayout: false
        };

        // หา parent menu และเพิ่ม submenu
        if (parentMenuId && !isNaN(parentMenuId)) {
          const parentMenu = this.findParentMenuInGroups(menuItems, parentMenuId);
          if (parentMenu) {
            if (!parentMenu.subItems) {
              parentMenu.subItems = [];
            }
            parentMenu.subItems.push(submenuItem);
          }
        }
      }
    });

    return menuItems;
  }

  /**
   * หา parent menu ในโครงสร้าง groups
   */
  private findParentMenuInGroups(groups: MenuItem[], parentId: number): MenuItem | null {
    for (const group of groups) {
      if (group.subItems) {
        for (const menu of group.subItems) {
          if (menu.id === parentId) {
            return menu;
          }
          // ตรวจสอบ submenu ในระดับลึก
          if (menu.subItems) {
            const found = this.findMenuInSubItems(menu.subItems, parentId);
            if (found) return found;
          }
        }
      }
    }
    return null;
  }

  /**
   * หา menu ใน subItems
   */
  private findMenuInSubItems(subItems: MenuItem[], parentId: number): MenuItem | null {
    for (const item of subItems) {
      if (item.id === parentId) {
        return item;
      }
      if (item.subItems) {
        const found = this.findMenuInSubItems(item.subItems, parentId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * โหลด menu จาก session storage
   */
  private loadMenuFromStorage(): void {
    // ตรวจสอบ session ก่อน
    if (this.sessionService.hasValidSession()) {
      const session = this.sessionService.getUserSession();
      if (session && session.menuData && session.menuData.length > 0) {
        console.log('Loading menu from session storage:', session.menuData);
        this.menuItemsSubject.next(session.menuData);
        return;
      }
    }
    
    // ถ้าไม่มี session หรือไม่มี menu data ให้ใช้ menu เริ่มต้น
    console.log('No valid session or menu data, using empty menu');
    this.menuItemsSubject.next([]);
  }

  /**
   * ดึง menu ปัจจุบัน
   */
  getCurrentMenuItems(): MenuItem[] {
    return this.menuItemsSubject.value;
  }

  /**
   * อัปเดต menu items
   */
  updateMenuItems(menuItems: MenuItem[]) {
    this.menuItemsSubject.next(menuItems);
    // เก็บ menu ใน session ด้วย
    this.sessionService.storeMenuData(menuItems);
  }

  /**
   * ลบ menu จาก session storage
   */
  clearMenu(): void {
    this.sessionService.clearSession();
    this.menuItemsSubject.next([]);
  }

  /**
   * Refresh menu จาก session
   */
  refreshMenuFromSession(): void {
    console.log('Refreshing menu from session...');
    this.loadMenuFromStorage();
  }

  /**
   * ตรวจสอบว่ามี menu ใน session หรือไม่
   */
  hasMenuInSession(): boolean {
    return this.sessionService.hasMenuData();
  }

  // Helper functions สำหรับ Permission Groups
  private getGroupLabel(groupId: string): string {
    const groupConfig = MenuMappingHelper.getGroupConfig(groupId);
    return groupConfig ? groupConfig.groupName : `Group ${groupId}`;
  }

  private getGroupIcon(groupId: string): string {
    const groupConfig = MenuMappingHelper.getGroupConfig(groupId);
    return groupConfig ? groupConfig.groupIcon : 'mdi mdi-folder';
  }

  // Helper functions สำหรับ Menus
  private getMenuLabel(menuId: string): string {
    const menuConfig = MenuMappingHelper.getMenuConfig(menuId);
    return menuConfig ? menuConfig.menuName : `Menu ${menuId}`;
  }

  private getMenuIcon(menuId: string): string {
    const menuConfig = MenuMappingHelper.getMenuConfig(menuId);
    return menuConfig ? menuConfig.menuIcon : 'mdi mdi-circle';
  }

  private getMenuLink(menuId: string): string {
    const menuConfig = MenuMappingHelper.getMenuConfig(menuId);
    return menuConfig ? menuConfig.menuLink : '#';
  }

  // Helper functions สำหรับ Submenus
  private getSubmenuLabel(submenuId: string): string {
    const submenuConfig = MenuMappingHelper.getSubmenuConfig(submenuId);
    return submenuConfig ? submenuConfig.submenuName : `Submenu ${submenuId}`;
  }

  private getSubmenuIcon(submenuId: string): string {
    const submenuConfig = MenuMappingHelper.getSubmenuConfig(submenuId);
    return submenuConfig ? submenuConfig.submenuIcon : 'mdi mdi-circle-small';
  }

  private getSubmenuLink(submenuId: string): string {
    const submenuConfig = MenuMappingHelper.getSubmenuConfig(submenuId);
    return submenuConfig ? submenuConfig.submenuLink : '#';
  }

  private getParentMenuId(submenuId: string): string {
    const parentMenuId = MenuMappingHelper.getParentMenuId(submenuId);
    return parentMenuId || '101';
  }

  /**
   * โหลด menu จาก API (legacy method)
   */
  loadMenuFromAPI(): Observable<any> {
    return this.http.get<any>(`${environment.GET_MasterData}/menu`);
  }

  /**
   * โหลด menu ตาม permission ของผู้ใช้ (legacy method)
   */
  loadMenuByPermission(permission: number): Observable<any> {
    return this.http.get<any>(`${environment.GET_MENU}?permission=${permission}`);
  }
}