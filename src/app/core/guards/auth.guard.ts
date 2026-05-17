import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })

export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // Check if user has selected permission stored
        const storedPermission = this.authenticationService.getStoredPermission();
        const storedToken = this.authenticationService.getStoredToken();
        
        if (storedPermission && storedToken) {
            // User has valid permission, allow access
            return true;
        } else {
            // No permission stored, redirect to permission page
            this.router.navigate(['/auth/permission']);
            return false;
        }
    }
}