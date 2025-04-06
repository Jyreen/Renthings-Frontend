import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ActivityLog, ActivityLogResponse } from '../_models';

const baseUrl = `${environment.apiUrl}/activity-logs`;

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  constructor(private http: HttpClient) {}

  // Get all logs with pagination
  getAll(page = 1, limit = 10): Observable<{ logs: ActivityLog[], totalPages: number, currentPage: number, totalItems: number }> {
    return this.http.get<{ logs: ActivityLog[], totalPages: number, currentPage: number, totalItems: number }>(
      `${baseUrl}?page=${page}&limit=${limit}`
    );
  }
  

  // Get logs by user ID
  getByUser(userId: number, page = 1, limit = 10): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${baseUrl}/user/${userId}?page=${page}&limit=${limit}`);
  }

  // Get logs by action
  getByAction(action: string, page = 1, limit = 10): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${baseUrl}/action/${action}?page=${page}&limit=${limit}`);
  }

  // Get logs by IP address
  getByIp(ipAddress: string, page = 1, limit = 10): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${baseUrl}/ip/${ipAddress}?page=${page}&limit=${limit}`);
  }

  // Get logs by date range
  getByDateRange(startDate: string, endDate: string, page = 1, limit = 10): Observable<ActivityLogResponse> {
    return this.http.post<ActivityLogResponse>(
      `${baseUrl}/date-range?page=${page}&limit=${limit}`,
      { startDate, endDate }
    );
  }
  
}
