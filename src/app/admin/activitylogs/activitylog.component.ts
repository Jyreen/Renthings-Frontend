import { Component, OnInit } from '@angular/core';
import { ActivityLogService } from '../../_services/activitylog.service';
import { ActivityLog, ActivityLogResponse } from '../../_models';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activitylog.component.html'
})
export class ActivityLogComponent implements OnInit {
    logs: ActivityLog[] = [];
    filteredLogs: ActivityLog[] = [];
  
    startDate: string = '';
    endDate: string = '';
  
    currentPage = 1;
    totalPages = 1;
    limit = 10;
  
    constructor(private activityLogService: ActivityLogService) {}
  
    ngOnInit(): void {
      this.fetchLogs();
    }
  
    fetchLogs(): void {
      this.activityLogService.getAll(this.currentPage, this.limit).subscribe({
        next: res => {
          this.logs = res.logs;
          this.filteredLogs = res.logs;
          this.totalPages = res.totalPages;
          this.currentPage = res.currentPage;
        },
        error: err => console.error('Error fetching logs:', err)
      });
    }
  
    filterByDate(): void {
      if (this.startDate && this.endDate) {
        this.activityLogService
          .getByDateRange(this.startDate, this.endDate, this.currentPage, this.limit)
          .subscribe(res => {
            this.filteredLogs = res.logs;
            this.totalPages = res.totalPages;
            this.currentPage = res.currentPage;
          });
      }
    }
  
    goToPage(page: number): void {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        if (this.startDate && this.endDate) {
          this.filterByDate();
        } else {
          this.fetchLogs();
        }
      }
    }
  
    exportToPDF(): void {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
  
      doc.setFontSize(18);
      doc.text('RENTHINGS - Activity Logs', 15, 15);
      doc.setFontSize(12);
      doc.text(`Exported on: ${currentDate}`, 15, 25);
  
      const headers = [['Username', 'Action', 'IP Address', 'Date']];
      const rows = this.filteredLogs.map(log => [
        log.username,
        log.action,
        log.ipAddress || 'N/A',
        new Date(log.createdAt!).toLocaleString()
      ]);
  
      autoTable(doc, {
        startY: 30,
        head: headers,
        body: rows
      });
  
      doc.save(`Activity_Logs_${currentDate}.pdf`);
    }
  }
