import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Role } from '../_models';
import { AccountService } from '../_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot) {
        const account = this.accountService.accountValue;
        if (account) {
            // check if route is restricted by role
            if (route.data.roles && !route.data.roles.includes(account.acc_role)) {
                 // Role not authorized, so redirect to the appropriate page
                 if (account.acc_role === Role.User) {
                    this.router.navigate(['/dashboard-switch']);
                } else if (account.acc_role === Role.Admin) {
                    this.router.navigate(['/admin-dashboard']);
                }
                return false;
            }

            // authorized so return true
            return true;
        }

        // not logged in so redirect to login page with the return url 
        this.router.navigate(['/account/login-register'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}