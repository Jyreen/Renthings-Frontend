
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Account } from '../_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account>;
    public account: Observable<Account>;
    private refreshTokenKey = 'refreshToken'; // Key for local storage

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account>(null);
        this.account = this.accountSubject.asObservable();
    }

    public refreshTokenn: string; // Declare refreshToken variable

    public get accountValue(): Account {
        return this.accountSubject.value;
    }

    login(acc_email: string, acc_passwordHash: string) {
        return this.http.post<any>(`${baseUrl}/authenticate`, { acc_email, acc_passwordHash }, { withCredentials: true })
            .pipe(
                map(account => {
                    // Check if the refresh token is present in the response
                    if (account && account.refreshToken) {
                        // Save the refresh token to localStorage
                        localStorage.setItem('refreshToken', account.refreshToken);
    
                        // Optional: Save access token or other account info if needed
                        localStorage.setItem('accessToken', account.accessToken);
    
                        // Set account info in the observable subject
                        this.accountSubject.next(account);
    
                        // Start refresh token timer for automatic token refresh
                        this.startRefreshTokenTimer();
    
                        return account; // Return account for further usage
                    } else {
                        console.error('Login failed: No refresh token provided.');
                        return null; // Return null or handle as needed if no token is found
                    }
                })
            );
    }
    
    isLoggedIn(): boolean {
        // Check if there's a valid account value or access token
        return !!localStorage.getItem('accessToken');
    }
    

    logout() {
        const refreshToken = localStorage.getItem('refreshToken'); // Example retrieval from local storage
        if (!refreshToken) {
            console.error('No refresh token found.');
            return;
        }
        return this.http.post<any>(`${baseUrl}/revoke-token`, { token: refreshToken }, { withCredentials: true })
            .subscribe({
                next: () => {
                    this.stopRefreshTokenTimer();
                    this.accountSubject.next(null);
                    this.router.navigate(['/account/login-register']);
                    console.log("token", refreshToken)
                },
                error: (error) => {
                    console.error('Logout error:', error);
                    console.log("token", refreshToken)
                    // Handle error as needed
                }
            });
    }
    refreshAccessToken(): Observable<any> {
        return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
            .pipe(map(account => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer(); // Start timer for the new token
                return account;
            }));
    }
    
    register(account: Account) {
        return this.http.post(`${baseUrl}/register`, account);
    }

    verifyEmail(token: string) {
        return this.http.post(`${baseUrl}/verify-email`, { token });
    }
    
    forgotPassword(email: string) {
        return this.http.post(`${baseUrl}/forgot-password`, { email });
    }
    
    validateResetToken(token: string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token });
    }
    
    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    getAll() {
        return this.http.get<Account[]>(baseUrl);
    }

    getById(id: string) {
        return this.http.get<Account>(`${baseUrl}/${id}`);
    }
    
    create(params) {
        return this.http.post(baseUrl, params);
    }
    
    update(id, params) {
        return this.http.put(`${baseUrl}/${id}`, params)
            .pipe(map((account: any) => {
                // update the current account if it was updated
                if (account.id === this.accountValue.id) {
                    // publish updated account to subscribers
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }
    
    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`)
            .pipe(finalize(() => {
                // auto logout if the logged in account was deleted
                if (id === this.accountValue.id)
                    this.logout();
            }));
    }

    // helper methods



    private refreshTokenTimeout: any;

    private startRefreshTokenTimer() {
        const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000); // 1 minute before expiration

        this.refreshTokenTimeout = setTimeout(() => this.refreshAccessToken().subscribe(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }

    updateProfileImage(formData: FormData): Observable<any> {
        return this.http.post(`${baseUrl}/update-profile-image`, formData, {
          withCredentials: true
        });
    }
}
