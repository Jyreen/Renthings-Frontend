import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { UserReportService } from '../../_services/report.service';
import { Account } from '../../_models/account';
import { UserReport } from '../../_models/report';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
    selector: 'app-accounts-report',
    templateUrl: './accounts-report.component.html',
})
export class AccountsReportComponent implements OnInit {
    reports: UserReport[] = [];
    accounts: Account[] = [];
    filteredReports: any[] = [];

    // modal evidence
    modalVisible: boolean = false;
    selectedEvidence: string | null = null;

    constructor(
        private reportService: UserReportService,
        private cdr: ChangeDetectorRef 
    ) {}

    ngOnInit(): void {
        this.loadReports();
    }

    loadReports(): void {
        this.reportService.getAll(1, 50).subscribe(response => {
            this.reports = response.reports;
            this.filteredReports = this.reports.map(report => ({
                ...report,
                acc_firstName: 'Unknown', // Placeholder until accounts are matched
                acc_lastName: '',
                acc_email: 'Unknown',
            }));
            this.cdr.detectChanges();
        });
    }

    updateStatusReport(id: number, newStatus: string) {
        if(!newStatus || newStatus === 'Flag as:') return;


        this.reportService.updateStatus(id, newStatus).subscribe(response => {
            console.log('Status updated into: ', response);
            Swal.fire({
                icon: 'success',
                title: 'Status Update Successfully',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            })
            this.loadReports();
        })
    }

    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'resolved':
                return 'badge-success';
            case 'pending':
                return 'badge-warning';
            case 'dismissed':
                return 'badge-danger';
            case 'reviewed':
                return 'badge-primary'; // Add more cases if needed
            default:
                return 'badge-light'; // Default class if status is unknown
        }
    }

    openEvidenceModal(evidencePath: string) {
        this.selectedEvidence = `http://localhost:4000/assets/${evidencePath}`;
        this.modalVisible = true;
        console.log('view evidence: ', evidencePath);
    }

    closeEvidenceModal() {
        this.modalVisible = false;
        this.selectedEvidence = null;
    }
    
    exportToPDF() {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();
    
        // Title and Date
        doc.setFontSize(18);
        doc.text('RENTHINGS - Reported Violations', 15, 15);
        doc.setFontSize(12);
        doc.text(`Exported on: ${currentDate}`, 15, 25);
    
        // Table Headers
        const headers = [['Name', 'Email', 'Reason', 'Description', 'Status']];
    
        // Table Data
        const data = this.reports.map((report: any) => [
            report?.reportedUser?.fullName || '',  // Type assertion allows access
            report?.reportedUser?.email || '',
            report.reason_display || '',
            report.description || '',
            report.status || ''
        ]);
    
        // Generate Table
        autoTable(doc, {
            startY: 30,
            head: headers,
            body: data
        });
    
        // Save PDF
        doc.save(`Reported_Violations_${currentDate}.pdf`);
    }
    

    /**
     * approveReport(id: number): void {
        this.reportService.updateStatus(id, 'approved').subscribe(() => {
            this.filteredReports = this.filteredReports.map(report =>
                report.id === id ? { ...report, status: 'approved' } : report
            );
        });
    }

    rejectReport(id: number): void {
        this.reportService.updateStatus(id, 'rejected').subscribe(() => {
            this.filteredReports = this.filteredReports.map(report =>
                report.id === id ? { ...report, status: 'rejected' } : report
            );
        });
    }
     */
}