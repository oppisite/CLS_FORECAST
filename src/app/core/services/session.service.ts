import { Injectable } from '@angular/core';
import { MenuItem } from '../../layouts/sidebar/menu.model';

export interface UserSession {
  token: string;
  permissionId: string;
  permissionData: any;
  authenData: any;
  menuData: MenuItem[];
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly SESSION_KEY = 'userSession';
  private readonly MENU_KEY = 'sidebarMenu';
  private readonly PERMISSION_KEY = 'selectedPermission';
  private readonly TOKEN_KEY = 'authToken';

  constructor() { }

  /**
   * เก็บข้อมูล session ทั้งหมด
   */
  storeUserSession(session: UserSession): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  /**
   * ดึงข้อมูล session ทั้งหมด
   */
  getUserSession(): UserSession | null {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.lastUpdated = new Date(session.lastUpdated);
      return session;
    }
    return null;
  }

  /**
   * เก็บข้อมูล menu ใน session
   */
  storeMenuData(menuData: MenuItem[]): void {
    localStorage.setItem(this.MENU_KEY, JSON.stringify(menuData));
  }

  /**
   * ดึงข้อมูล menu จาก session
   */
  getMenuData(): MenuItem[] {
    const menuData = localStorage.getItem(this.MENU_KEY);
    return menuData ? JSON.parse(menuData) : [];
  }

  /**
   * เก็บข้อมูล permission ใน session
   */
  storePermissionData(permissionData: any): void {
    localStorage.setItem(this.PERMISSION_KEY, JSON.stringify(permissionData));
  }

  /**
   * ดึงข้อมูล permission จาก session
   */
  getPermissionData(): any {
    const permissionData = localStorage.getItem(this.PERMISSION_KEY);
    return permissionData ? JSON.parse(permissionData) : null;
  }

  /**
   * เก็บ token ใน session
   */
  storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * ดึง token จาก session
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * ตรวจสอบว่ามี session อยู่หรือไม่
   */
  hasValidSession(): boolean {
    const session = this.getUserSession();
    if (!session) return false;

    // ตรวจสอบว่า session ไม่หมดอายุ (24 ชั่วโมง)
    const now = new Date();
    const sessionTime = new Date(session.lastUpdated);
    const hoursDiff = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 24 && !!session.token && !!session.permissionId;
  }

  /**
   * อัปเดต session
   */
  updateSession(updates: Partial<UserSession>): void {
    const currentSession = this.getUserSession();
    if (currentSession) {
      const updatedSession = { ...currentSession, ...updates, lastUpdated: new Date() };
      this.storeUserSession(updatedSession);
    }
  }

  /**
   * ลบ session ทั้งหมด
   */
  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.MENU_KEY);
    localStorage.removeItem(this.PERMISSION_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * เก็บข้อมูล session ใหม่
   */
  createNewSession(token: string, permissionId: string, permissionData: any, authenData: any, menuData: MenuItem[]): void {
    const session: UserSession = {
      token,
      permissionId,
      permissionData,
      authenData,
      menuData,
      lastUpdated: new Date()
    };
    this.storeUserSession(session);
  }

  /**
   * ตรวจสอบว่ามี menu data อยู่หรือไม่
   */
  hasMenuData(): boolean {
    const menuData = this.getMenuData();
    return menuData && menuData.length > 0;
  }

  /**
   * ตรวจสอบว่ามี permission data อยู่หรือไม่
   */
  hasPermissionData(): boolean {
    const permissionData = this.getPermissionData();
    return permissionData !== null;
  }

  /**
   * ตรวจสอบว่ามี token อยู่หรือไม่
   */
  hasToken(): boolean {
    const token = this.getToken();
    return token !== null && token.length > 0;
  }
}
