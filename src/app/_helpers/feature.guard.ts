import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class FeatureGuard implements CanActivate, CanLoad {

    // Define feature flags
    // true: enabled, false: display progress page
    private featureFlags: { [key: string]: boolean } = {
        account: true,
        profile: true,
        admin: true,   
        about: true,
        home: true,
        "item/:id": true,
        "view-renters/:itemId": true,
        rent: true,
        list: true,
        message: true,

        // Admin pages
        "admin/accounts-report": true,
        "admin/items-report": false,
        "admin/subscriptions-report": false,
    };

    constructor(private router: Router) {}

    // For component routes
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const feature = route.routeConfig?.path;
        
        if (feature && !this.isFeatureEnabled(feature)) {
            this.router.navigate(['/progress']); // Redirect if feature is disabled
            return false;
        }
        return true;
    }

    // For lazy-loaded modules
    canLoad(route: Route, segments: UrlSegment[]): boolean {
        const feature = route.path;

        if (feature && !this.isFeatureEnabled(feature)) {
            this.router.navigate(['/progress']); // Redirect if module is disabled
            return false;
        }
        return true;
    }

    // Helper method to check feature availability
    private isFeatureEnabled(feature: string): boolean {
        return this.featureFlags[feature] !== false;
    }
}
