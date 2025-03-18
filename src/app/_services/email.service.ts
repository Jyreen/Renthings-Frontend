import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private scriptURL = 'https://script.google.com/macros/s/AKfycbxrEPzijaIaL-_jP_4cMf5jA8FEwFtmAVgeM9mLJbYzU4GupGC5aXDbfpQ6cIlRMgry/exec';

  constructor(private http: HttpClient) {}

  sendEmail(email: string): Observable<any> {
    const formData = new FormData();
    formData.append('Email Address', email);

    return this.http.post(this.scriptURL, formData);
  }
}
