import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor() {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = req;
        
        return of(null).pipe(
            delay(500), // Simulate network delay
            mergeMap(() => {
                // Authentication & Account Endpoints
                if (url.endsWith('/accounts/authenticate') && method === 'POST') return authenticate();
                if (url.endsWith('/accounts/register') && method === 'POST') return register();
                if (url.endsWith('/accounts/refresh-token') && method === 'POST') return refreshToken();
                if (url.endsWith('/accounts/revoke-token') && method === 'POST') return revokeToken();
                if (url.endsWith('/accounts') && method === 'GET') return getAllAccounts();
                if (url.match(/\/accounts\/\d+$/) && method === 'GET') return getAccountById();
                if (url.match(/\/accounts\/\d+$/) && method === 'PUT') return updateAccount();
                if (url.match(/\/accounts\/\d+$/) && method === 'DELETE') return deleteAccount();
                if (url.endsWith('/accounts/update-profile-image') && method === 'POST') return updateProfileImage();
            
                // Item Endpoints
                if (url.endsWith('/items') && method === 'GET') return getAllItems();
                if (url.match(/\/items\/\d+$/) && method === 'GET') return getItemById();
                if (url.match(/\/items\/account\/\d+$/) && method === 'GET') return getItemsByAccountId();
                if (url.endsWith('/items') && method === 'POST') return createItem();
                if (url.match(/\/items\/\d+$/) && method === 'PUT') return updateItem();
                if (url.match(/\/items\/\d+\/approve$/) && method === 'PUT') return approveItem();
                if (url.match(/\/items\/\d+\/reject$/) && method === 'PUT') return rejectItem();
                if (url.match(/\/items\/\d+$/) && method === 'DELETE') return deleteItem();
            
                // Rental Item Endpoints
                if (url.endsWith('/rentitem') && method === 'GET') return getAllRentItems();
                if (url.match(/\/rentitem\/\d+$/) && method === 'GET') return getRentItemById();
                if (url.match(/\/rentitem\/account\/\d+$/) && method === 'GET') return getRentalsByAccountId();
                if (url.match(/\/rentitem\/item\/\d+$/) && method === 'GET') return getRentersByItemId();
                if (url.endsWith('/rentitem') && method === 'POST') return createRentItem();
                if (url.match(/\/rentitem\/\d+$/) && method === 'PUT') return updateRentItem();
                if (url.match(/\/rentitem\/\d+\/approve$/) && method === 'PUT') return approveRentItem();
                if (url.match(/\/rentitem\/\d+\/reject$/) && method === 'PUT') return rejectRentItem();
                if (url.match(/\/rentitem\/\d+$/) && method === 'DELETE') return deleteRentItem();
            
                
                return next.handle(req);
            })
            
        );

        function authenticate() {
            const { acc_email, acc_passwordHash } = body;
            let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            const account = accounts.find((a: any) => a.acc_email === acc_email && a.acc_passwordHash === acc_passwordHash);
            if (!account) return error('Invalid credentials');

            account.accessToken = `fake-jwt-token-${account.id}`;
            account.refreshToken = `fake-refresh-token-${account.id}`;
            localStorage.setItem('accounts', JSON.stringify(accounts));

            return ok(account);
        }

        function register() {
            let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            const isAdmin = accounts.length === 0 ? 'Admin' : 'User'; // First account is Admin
            const account = { id: accounts.length + 1, role: isAdmin, ...body };

            accounts.push(account);
            localStorage.setItem('accounts', JSON.stringify(accounts));
            return ok(account);
        }

        function refreshToken() {
            const refreshToken = headers.get('Authorization')?.split(' ')[1];
            let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            const account = accounts.find((a: any) => a.refreshToken === refreshToken);
            if (!account) return error('Invalid refresh token');

            account.accessToken = `fake-jwt-token-${account.id}-${new Date().getTime()}`;
            localStorage.setItem('accounts', JSON.stringify(accounts));
            return ok({ accessToken: account.accessToken });
        }

        function revokeToken() {
            const refreshToken = body.token;
            let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            let account = accounts.find((a: any) => a.refreshToken === refreshToken);
            if (!account) return error('Invalid refresh token');

            account.refreshToken = null;
            localStorage.setItem('accounts', JSON.stringify(accounts));
            return ok({ message: 'Token revoked' });
        }

        function getAllAccounts() {
            let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            return ok(accounts);
        }

        function getAccountById() {
            let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            const account = accounts.find((a: any) => a.id === id);
            if (!account) return error('Account not found');
            return ok(account);
        }

        function updateAccount() {
            let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            let accountIndex = accounts.findIndex((a: any) => a.id === id);
            if (accountIndex === -1) return error('Account not found');

            accounts[accountIndex] = { ...accounts[accountIndex], ...body };
            localStorage.setItem('accounts', JSON.stringify(accounts));
            return ok(accounts[accountIndex]);
        }

        function deleteAccount() {
            let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            accounts = accounts.filter((a: any) => a.id !== id);
            localStorage.setItem('accounts', JSON.stringify(accounts));
            return ok({ message: 'Account deleted' });
        }

        function updateProfileImage() {
            return ok({ message: 'Profile image updated successfully' });
        }

        // Items Services
        function getAllItems() {
            let items = JSON.parse(localStorage.getItem('items') || '[]');
            return ok(items);
        }

        function getItemById() {
            let items = JSON.parse(localStorage.getItem('items') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            const item = items.find((i: any) => i.id === id);
            if (!item) return error('Item not found');
            return ok(item);
        }

        function getItemsByAccountId() {
            let items = JSON.parse(localStorage.getItem('items') || '[]');
            const acc_id = parseInt(url.split('/').pop() || '0', 10);
            const accountItems = items.filter((i: any) => i.acc_id === acc_id);
            return ok(accountItems);
        }

        function createItem() {
            let items = JSON.parse(localStorage.getItem('items') || '[]');
            const newItem = { id: items.length + 1, status: 'pending', ...body };

            items.push(newItem);
            localStorage.setItem('items', JSON.stringify(items));
            return ok(newItem);
        }

        function updateItem() {
            let items = JSON.parse(localStorage.getItem('items') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            let itemIndex = items.findIndex((i: any) => i.id === id);
            if (itemIndex === -1) return error('Item not found');

            items[itemIndex] = { ...items[itemIndex], ...body };
            localStorage.setItem('items', JSON.stringify(items));
            return ok(items[itemIndex]);
        }

        function approveItem() {
            let items = JSON.parse(localStorage.getItem('items') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            let item = items.find((i: any) => i.id === id);
            if (!item) return error('Item not found');

            item.status = 'approved';
            localStorage.setItem('items', JSON.stringify(items));
            return ok(item);
        }

        function rejectItem() {
            let items = JSON.parse(localStorage.getItem('items') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            let item = items.find((i: any) => i.id === id);
            if (!item) return error('Item not found');

            item.status = 'rejected';
            item.rejection_reason = body.rejection_reason;
            localStorage.setItem('items', JSON.stringify(items));
            return ok(item);
        }

        function deleteItem() {
            let items = JSON.parse(localStorage.getItem('items') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            items = items.filter((i: any) => i.id !== id);
            localStorage.setItem('items', JSON.stringify(items));
            return ok({ message: 'Item deleted' });
        }

        function ok(body?: any) {
            return of(new HttpResponse({ status: 200, body }));
        }

        function error(message: string) {
            return throwError(() => ({ error: { message } }));
        }

        function getAllRentItems() {
            let rentItems = JSON.parse(localStorage.getItem('rentItems') || '[]');
            return ok(rentItems);
        }
        
        function getRentItemById() {
            let rentItems = JSON.parse(localStorage.getItem('rentItems') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            const rentItem = rentItems.find((r: any) => r.id === id);
            if (!rentItem) return error('Rental item not found');
            return ok(rentItem);
        }
        
        function getRentalsByAccountId() {
            let rentItems = JSON.parse(localStorage.getItem('rentItems') || '[]');
            const acc_id = parseInt(url.split('/').pop() || '0', 10);
            const accountRentals = rentItems.filter((r: any) => r.renter_acc_id === acc_id);
            return ok(accountRentals);
        }
        
        function getRentersByItemId() {
            let rentItems = JSON.parse(localStorage.getItem('rentItems') || '[]');
            const itemId = parseInt(url.split('/').pop() || '0', 10);
            const itemRenters = rentItems.filter((r: any) => r.Item_id === itemId);
            return ok(itemRenters);
        }
        
        function createRentItem() {
            let rentItems = JSON.parse(localStorage.getItem('rentItems') || '[]');
            const newRentItem = { id: rentItems.length + 1, status: 'pending', ...body };
        
            rentItems.push(newRentItem);
            localStorage.setItem('rentItems', JSON.stringify(rentItems));
            return ok(newRentItem);
        }
        
        function updateRentItem() {
            let rentItems = JSON.parse(localStorage.getItem('rentItems') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            let rentItemIndex = rentItems.findIndex((r: any) => r.id === id);
            if (rentItemIndex === -1) return error('Rental item not found');
        
            rentItems[rentItemIndex] = { ...rentItems[rentItemIndex], ...body };
            localStorage.setItem('rentItems', JSON.stringify(rentItems));
            return ok(rentItems[rentItemIndex]);
        }
        
        function approveRentItem() {
            let rentItems = JSON.parse(localStorage.getItem('rentItems') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            let rentItem = rentItems.find((r: any) => r.id === id);
            if (!rentItem) return error('Rental item not found');
        
            rentItem.status = 'approved';
            localStorage.setItem('rentItems', JSON.stringify(rentItems));
            return ok(rentItem);
        }
        
        function rejectRentItem() {
            let rentItems = JSON.parse(localStorage.getItem('rentItems') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            let rentItem = rentItems.find((r: any) => r.id === id);
            if (!rentItem) return error('Rental item not found');
        
            rentItem.status = 'rejected';
            rentItem.rejection_reason = body.rejection_reason;
            localStorage.setItem('rentItems', JSON.stringify(rentItems));
            return ok(rentItem);
        }
        
        function deleteRentItem() {
            let rentItems = JSON.parse(localStorage.getItem('rentItems') || '[]');
            const id = parseInt(url.split('/').pop() || '0', 10);
            rentItems = rentItems.filter((r: any) => r.id !== id);
            localStorage.setItem('rentItems', JSON.stringify(rentItems));
            return ok({ message: 'Rental item deleted' });
        }
        
        
        
    }
}
