import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RentItem } from '../_models/rent-items'

const baseUrl = `${environment.apiUrl}/rentitem`;

@Injectable({
  providedIn: 'root',
})
export class RentItemService {
  constructor(private http: HttpClient) {}

  // Get all rental items
  getAll(): Observable<RentItem[]> {
    return this.http.get<RentItem[]>(`${baseUrl}`);
  }

  // Get rental item by ID
  getById(id: number): Observable<RentItem> {
    return this.http.get<RentItem>(`${baseUrl}/${id}`);
  }

  // Get rentals by account ID
  getRentalsByAccountId(acc_id: number): Observable<RentItem[]> {
    return this.http.get<RentItem[]>(`${baseUrl}/account/${acc_id}`);
  }

  // Create a new rental item
  create(rentItemData: FormData): Observable<RentItem> {
    return this.http.post<RentItem>(`${baseUrl}`, rentItemData);
  }

  // Update an existing rental item
  update(id: number, rentItem: Partial<RentItem>, verificationImage?: File): Observable<RentItem> {
    const formData = new FormData();
    if (rentItem.Item_id) formData.append('Item_id', rentItem.Item_id.toString());
    if (rentItem.renter_acc_id) formData.append('renter_acc_id', rentItem.renter_acc_id.toString());
    if (rentItem.rental_start_date) formData.append('rental_start_date', rentItem.rental_start_date.toISOString());
    if (rentItem.rental_end_date) formData.append('rental_end_date', rentItem.rental_end_date.toISOString());
    if (verificationImage) formData.append('verification_image', verificationImage);
    
    return this.http.put<RentItem>(`${baseUrl}/${id}`, formData);
  }

  // Approve a rental item
  approveRental(id: number): Observable<RentItem> {
    return this.http.put<RentItem>(`${baseUrl}/${id}/approve`, {});
  }

  // Reject a rental item
  rejectRental(id: number, rejection_reason: string): Observable<RentItem> {
    return this.http.put<RentItem>(`${baseUrl}/${id}/reject`, { rejection_reason });
  }

  // Delete a rental item
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${id}`);
  }
}
