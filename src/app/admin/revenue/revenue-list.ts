import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SubscriptionService } from '../../_services/subscription.service';
import { Subscription } from '../../_models/subscription';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, ChartConfiguration } from 'chart.js/auto'; // Correct import for Chart.js v4

@Component({
    selector: 'app-revenue',
    templateUrl: './revenue-list.html',
    styleUrls: ['./revenue-list.css'] // Add a CSS file for styling
})
export class RevenueComponent implements OnInit, AfterViewInit {
    subscriptions: Subscription[] = [];
    filteredSubscriptions: Subscription[] = [];
    startDate = '';
    endDate = '';
    totalRevenue = 0;
    private chart: Chart | null = null; // Use proper Chart type instead of any

    constructor(private subscriptionService: SubscriptionService) {}

    ngOnInit() {
        this.loadSubscriptions();
    }

    ngAfterViewInit() {
        // Ensure the canvas is rendered before initializing the chart
        this.updateChart();
    }

    loadSubscriptions() {
        this.subscriptionService.getApproved().subscribe({
            next: (data) => {
                console.log('Subscriptions loaded:', data);
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
                this.updateChart(); // Update chart after loading data
            },
            error: (error) => {
                console.error('Error loading subscriptions:', error);
            }
        });
    }

    filterByDate() {
        if (!this.startDate || !this.endDate) {
            this.filteredSubscriptions = [...this.subscriptions];
        } else {
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            this.filteredSubscriptions = this.subscriptions.filter(sub => {
                const subDate = new Date(sub.start_date);
                return subDate >= start && subDate <= end;
            });
        }
        this.calculateTotalRevenue();
        this.updateChart(); // Update chart after filtering
    }

    calculateTotalRevenue() {
        this.totalRevenue = this.filteredSubscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);
    }

    exportToPDF() {
        const doc = new jsPDF();
        doc.text('Revenue Report', 10, 10);
        autoTable(doc, {
            head: [['ID', 'Plan', 'Price', 'Start Date', 'End Date']],
            body: this.filteredSubscriptions.map(sub => [
                sub.id,
                sub.subscription_plan,
                sub.price,
                sub.start_date instanceof Date ? sub.start_date.toISOString().split('T')[0] : sub.start_date,
                sub.end_date instanceof Date ? sub.end_date.toISOString().split('T')[0] : sub.end_date
            ])
        });
        doc.text(`Total Revenue: ₱${this.totalRevenue}`, 10, (doc as any).lastAutoTable.finalY + 10);
        doc.save('revenue_report.pdf');
    }

    getSubscriptionDuration(startDate: Date, endDate: Date): number {
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        return months;
    }

    getPrice(duration: number): number {
        if (duration === 1) return 500;
        if (duration === 3) return 1450;
        if (duration === 6) return 2900;
        return 0;
    }

    updateChart() {
        try {
            const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
            if (!canvas) {
                console.error('Canvas element not found');
                return;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get 2D context');
                return;
            }
            const chartData = this.getChartData();

            if (this.chart) {
                this.chart.destroy();
            }

            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Revenue (₱)',
                        data: chartData.revenues,
                        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
                        borderColor: ['#4e73df', '#1cc88a', '#36b9cc'],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Revenue (₱)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Subscription Plan'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering chart:', error);
        }
    }

    getChartData() {
        const planRevenue: { [key: string]: number } = {
            '1 Month': 0,
            '3 Months': 0,
            '6 Months': 0
        };

        if (!this.filteredSubscriptions || this.filteredSubscriptions.length === 0) {
            console.warn('No subscriptions data available for chart');
            return {
                labels: Object.keys(planRevenue),
                revenues: Object.values(planRevenue)
            };
        }

        this.filteredSubscriptions.forEach(sub => {
            if (sub && typeof sub.durationMonths === 'number' && typeof sub.price === 'number') {
                const duration = sub.durationMonths;
                const plan = duration === 1 ? '1 Month' : duration === 3 ? '3 Months' : duration === 6 ? '6 Months' : 'Other';
                if (plan !== 'Other') {
                    planRevenue[plan] += sub.price;
                }
            } else {
                console.warn('Invalid subscription data:', sub);
            }
        });

        console.log('Chart Data:', {
            labels: Object.keys(planRevenue),
            revenues: Object.values(planRevenue)
        });

        return {
            labels: Object.keys(planRevenue),
            revenues: Object.values(planRevenue)
        };
    }
}