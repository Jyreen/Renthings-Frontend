import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-subscriptions-report',
    templateUrl: './subscriptions-report.component.html',
})
export class SubscriptionsReportComponent implements OnInit {

    subscriptions: any[] = [];

    constructor() { }

    ngOnInit(): void {
        this.loadSubscriptions();
    }

    loadSubscriptions(): void {
        // Replace with actual data fetching logic
        this.subscriptions = [
            { id: 1, name: 'Subscription 1', status: 'Active' },
            { id: 2, name: 'Subscription 2', status: 'Inactive' },
            { id: 3, name: 'Subscription 3', status: 'Active' }
        ];
    }

}