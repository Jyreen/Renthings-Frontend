import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subscription } from '../_models/subscription';
import { Observable } from 'rxjs';
import { Account } from '../_models';
import { AccountService } from './account.service';

const baseUrl = `${environment.apiUrl}/subscription`;

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
    constructor(private http: HttpClient) {}

    // Get all subscriptions
    getAll(): Observable<Subscription[]> {
        return this.http.get<Subscription[]>(`${baseUrl}`);
    }

    // Get subscription by ID
    getById(id: number): Observable<Subscription> {
        return this.http.get<Subscription>(`${baseUrl}/${id}`);
    }

    // Create a new subscription
    create(subscriptionData: FormData): Observable<Subscription> {
        return this.http.post<Subscription>(`${baseUrl}`, subscriptionData);
    }

    // Update an existing subscription
    update(id: number, subscription: Partial<Subscription>, subscriptionReceipt?: File): Observable<Subscription> {
        const formData = new FormData();
        if (subscription.acc_id) formData.append('acc_id', subscription.acc_id.toString());
        if (subscription.start_date) formData.append('start_date', subscription.start_date.toISOString());
        if (subscription.end_date) formData.append('end_date', subscription.end_date.toISOString());
        if (subscription.subscription_plan) formData.append('subscription_plan', subscription.subscription_plan);
        if (subscriptionReceipt) formData.append('subscription_receipt', subscriptionReceipt);
        return this.http.put<Subscription>(`${baseUrl}/${id}`, formData);
    }

    // Approve a subscription
    approveSubscription(id: number, remarks: string): Observable<Subscription> {
        return this.http.put<Subscription>(`${baseUrl}/${id}/approve`, { remarks });
    }

    // Reject a subscription
    rejectSubscription(id: number, remarks: string): Observable<Subscription> {
        return this.http.put<Subscription>(`${baseUrl}/${id}/reject`, { remarks });
    }
    
    // Delete a subscription
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${baseUrl}/${id}`);
    }
}
