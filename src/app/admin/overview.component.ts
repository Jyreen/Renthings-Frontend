import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { SubscriptionService } from '../_services/subscription.service';
import { ItemService } from '../_services/item.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html'
})
export class OverviewComponent implements OnInit {
  
  accountsPerMonth: any = {};
  revenuePerMonth: any = {};
  subscriptionsPerMonth: any = {};
  itemsPerMonth: any = {};

  constructor(
    private accountService: AccountService,
    private subscriptionService: SubscriptionService,
    private itemService: ItemService
  ) {}

  ngOnInit() {
    this.loadAccounts();
    this.loadSubscriptions();
    this.loadRevenue();
    this.loadItems();
  }

  loadAccounts() {
    this.accountService.getAll().subscribe(accounts => {
      this.accountsPerMonth = this.groupByMonth(accounts, 'acc_created');
      this.renderChart('accountsChart', this.accountsPerMonth, 'Accounts Created');
    });
  }

  loadSubscriptions() {
    this.subscriptionService.getAll().subscribe(subscriptions => {
      this.subscriptionsPerMonth = this.groupByMonth(subscriptions, 'start_date');
      this.renderChart('subscriptionsChart', this.subscriptionsPerMonth, 'New Subscriptions');
    });
  }

  loadRevenue() {
    this.subscriptionService.getApproved().subscribe(revenueData => {
      this.revenuePerMonth = this.groupByMonth(revenueData, 'start_date', 'amount');
      this.renderChart('revenueChart', this.revenuePerMonth, 'Revenue Generated');
    });
  }

  loadItems() {
    this.itemService.getAll().subscribe(items => {
      this.itemsPerMonth = this.groupByMonth(items, 'created_at');
      this.renderChart('itemsChart', this.itemsPerMonth, 'Items Added');
    });
  }

  groupByMonth(data: any[], dateField: string, sumField?: string) {
    const result: any = {};

    data.forEach(item => {
      const date = new Date(item[dateField]);
      const month = date.toLocaleString('default', { month: 'short' });

      if (!result[month]) result[month] = sumField ? 0 : 0;
      result[month] += sumField ? item[sumField] : 1;
    });

    return result;
  }

  renderChart(canvasId: string, data: any, label: string) {
    const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: label,
          data: Object.values(data),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}
