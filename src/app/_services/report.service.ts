import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserReport } from '../_models/report';

const baseUrl = `${environment.apiUrl}/reportuser`;

@Injectable({ providedIn: 'root' })
export class UserReportService {
    constructor(private http: HttpClient) {}

    // Create a new report
    create(reportData: FormData): Observable<UserReport> {
        return this.http.post<UserReport>(`${baseUrl}`, reportData);
    }

    // Get all reports with pagination and optional filters
    getAll(page: number = 1, limit: number = 10, status?: string, reason_type?: string): Observable<{ reports: UserReport[], totalPages: number, currentPage: number, totalCount: number }> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        if (status) params = params.set('status', status);
        if (reason_type) params = params.set('reason_type', reason_type);

        return this.http.get<{ reports: UserReport[], totalPages: number, currentPage: number, totalCount: number }>(`${baseUrl}`, { params });
    }

    // Get pending reports with pagination
    getPending(page: number = 1, limit: number = 10): Observable<{ reports: UserReport[], totalPages: number, currentPage: number, totalCount: number }> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<{ reports: UserReport[], totalPages: number, currentPage: number, totalCount: number }>(`${baseUrl}/pending`, { params });
    }

    // Get reports by reporter ID with pagination
    getByReporter(reporter_id: number, page: number = 1, limit: number = 10): Observable<{ reports: UserReport[], totalPages: number, currentPage: number, totalCount: number }> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<{ reports: UserReport[], totalPages: number, currentPage: number, totalCount: number }>(`${baseUrl}/by-reporter/${reporter_id}`, { params });
    }

    // Get reports against a specific user with pagination
    getAgainstUser(reported_id: number, page: number = 1, limit: number = 10): Observable<{ reports: UserReport[], totalPages: number, currentPage: number, totalCount: number }> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<{ reports: UserReport[], totalPages: number, currentPage: number, totalCount: number }>(`${baseUrl}/against-user/${reported_id}`, { params });
    }

    // Get a specific report by ID
    getById(id: number): Observable<UserReport> {
        return this.http.get<UserReport>(`${baseUrl}/${id}`);
    }

    // Update the status of a report
    updateStatus(id: number, status: string): Observable<UserReport> {
        return this.http.put<UserReport>(`${baseUrl}/${id}/status`, { status });
    }

    // Review a report
    reviewReport(id: number, reviewData: { status: string, reviewer_comments?: string, action_taken?: string }): Observable<UserReport> {
        return this.http.put<UserReport>(`${baseUrl}/${id}/review`, reviewData);
    }

    // Delete a report
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${baseUrl}/${id}`);
    }

    // Fetch the list of report reason types from the backend
    getReportReasonTypes(): Observable<{ reasons: Record<string, string> }> {
        return this.http.get<{ reasons: Record<string, string> }>(`${environment.apiUrl}/report-reason-types`);
    }
}
