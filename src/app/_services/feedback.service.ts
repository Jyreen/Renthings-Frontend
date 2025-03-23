import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Feedback } from '../_models';

const baseUrl = `${environment.apiUrl}/feedback`;

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private http: HttpClient) {}

  // Get all feedback
  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${baseUrl}`);
  }

  // Get feedback by ID
  getById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${baseUrl}/${id}`);
  }

  // Get feedback by RentItem ID
  getByRentItemId(RentItem_id: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${baseUrl}/rentitem/${RentItem_id}`);
  }

  // Get feedback by Item ID
  getByItemId(Item_id: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${baseUrl}/item/${Item_id}`);
  }

  // Get feedback by Account ID
  getByAccountId(acc_id: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${baseUrl}/account/${acc_id}`);
  }

  // Get average rating by Item ID
  getAverageRatingByItemId(Item_id: number): Observable<number> {
    return this.http.get<number>(`${baseUrl}/rating/${Item_id}`);
  }

  // Create a new feedback entry
  create(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(`${baseUrl}`, feedback);
  }

  // Update an existing feedback entry
  update(id: number, feedback: Partial<Feedback>): Observable<Feedback> {
    return this.http.put<Feedback>(`${baseUrl}/${id}`, feedback);
  }

  // Delete a feedback entry
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${id}`);
  }
}
