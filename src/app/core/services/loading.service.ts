import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCount = 0;
  private loadingMessageSubject = new BehaviorSubject<string>('กำลังโหลด...');

  constructor() { }

  /**
   * เริ่มต้น loading state
   * @param message ข้อความที่จะแสดงขณะ loading
   */
  show(message: string = 'กำลังโหลด...'): void {
    this.loadingCount++;
    this.loadingMessageSubject.next(message);
    this.loadingSubject.next(true);
  }

  /**
   * หยุด loading state
   */
  hide(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
    }
    
    if (this.loadingCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  /**
   * ตั้งค่า loading state โดยตรง
   * @param isLoading สถานะ loading
   * @param message ข้อความที่จะแสดง
   */
  setLoading(isLoading: boolean, message: string = 'กำลังโหลด...'): void {
    if (isLoading) {
      this.loadingCount = 1;
      this.loadingMessageSubject.next(message);
    } else {
      this.loadingCount = 0;
    }
    this.loadingSubject.next(isLoading);
  }

  /**
   * รีเซ็ต loading state
   */
  reset(): void {
    this.loadingCount = 0;
    this.loadingSubject.next(false);
    this.loadingMessageSubject.next('กำลังโหลด...');
  }

  /**
   * ตรวจสอบสถานะ loading ปัจจุบัน
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * รับ Observable ของ loading state
   */
  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /**
   * รับ Observable ของ loading message
   */
  get loadingMessage$(): Observable<string> {
    return this.loadingMessageSubject.asObservable();
  }

  /**
   * รับ loading message ปัจจุบัน
   */
  get currentMessage(): string {
    return this.loadingMessageSubject.value;
  }
}


