import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/auth.models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser = this.currentUserSubject.asObservable();
    
    // เพิ่ม loading state
    private loadingSubject = new BehaviorSubject<boolean>(true);
    public loading = this.loadingSubject.asObservable();

    constructor(private http: HttpClient) { 
        this.loadUserFromSession();
    }

    loadUserFromSession() {
        try {
        const userData = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
        if (userData) {
            this.currentUserSubject.next(userData);
        }
        this.loadingSubject.next(false);
        } catch (e) {
        console.error('Error loading user data:', e);
        this.loadingSubject.next(false);
        }
    }

     // อัปเดตข้อมูลผู้ใช้ (เรียกจาก Auth Guard)
    updateUser(userData: any) {
        this.currentUserSubject.next(userData);
    }

    // ล้างข้อมูลผู้ใช้เมื่อล็อกเอาท์
    clearUser() {
        this.currentUserSubject.next(null);
    }
    /***
     * Get All User
     */
    getAll() {
        return this.http.get<User[]>(`api/users`);
    }

    /***
     * Facked User Register
     */
    register(user: User) {
        return this.http.post(`/users/register`, user);
    }
}