import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from '../../_services/subscription.service';
import { Subscription } from '../../_models/subscription';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
(jsPDF as any).prototype.autoTable = autoTable;

@Component({
    selector: 'app-revenue',
    templateUrl: './revenue-list.html'
})
export class RevenueComponent implements OnInit {
    subscriptions: Subscription[] = [];  // Use the defined type
    filteredSubscriptions: Subscription[] = [];
    startDate = '';
    endDate = '';
    totalRevenue = 0;

    constructor(private subscriptionService: SubscriptionService) {}

    ngOnInit() {
        this.loadSubscriptions();
    }

    loadSubscriptions() {
        this.subscriptionService.getApproved().subscribe(data => {
            console.log(data)
            this.subscriptions = data.map(sub => {
                const duration = this.getSubscriptionDuration(new Date(sub.start_date), new Date(sub.end_date));
                return {
                    ...sub,
                    durationMonths: duration,
                    price: this.getPrice(duration)
                };
            });
    
            this.filteredSubscriptions = [...this.subscriptions];
            this.calculateTotalRevenue();
        });
    }
    

    filterByDate() {
        if (!this.startDate || !this.endDate) {
            this.filteredSubscriptions = this.subscriptions;
        } else {
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            this.filteredSubscriptions = this.subscriptions.filter(sub => {
                const subDate = new Date(sub.start_date);
                return subDate >= start && subDate <= end;
            });
        }
        this.calculateTotalRevenue();
    }

    calculateTotalRevenue() {
        this.totalRevenue = this.filteredSubscriptions.reduce((sum, sub) => sum + sub.price, 0);
    }

    exportToPDF() {
        const doc = new jsPDF();
        doc.text('Revenue Report', 10, 10);
        autoTable(doc, {
            head: [['ID', 'Name', 'Plan', 'Price', 'Start Date', 'End Date']],
            body: this.filteredSubscriptions.map(sub => [
                sub.id,
                //`${sub.subscriber?.acc_firstName} ${sub.subscriber?.acc_lastName}`,
                sub.subscription_plan,
                sub.price,
                sub.start_date instanceof Date ? sub.start_date.toISOString().split('T')[0] : sub.start_date,
                sub.end_date instanceof Date ? sub.end_date.toISOString().split('T')[0] : sub.end_date
            ])
        });
        doc.text(`Total Revenue: ${this.totalRevenue}`, 10, (doc as any).lastAutoTable.finalY + 10);
        doc.save('revenue_report.pdf');
    }
    

    getSubscriptionDuration(startDate: Date, endDate: Date): number {
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        return months;
    }
    
    getPrice(duration: number): number {
        if (duration === 1) return 50;
        if (duration === 3) return 70;
        if (duration === 6) return 85;
        return 0; // Default if duration doesn't match any known plan
    }
    
}
