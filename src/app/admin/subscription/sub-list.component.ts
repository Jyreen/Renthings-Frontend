import { Component, OnInit } from '@angular/core';
import { Subscription } from '../../_models/subscription';
import { SubscriptionService } from '../../_services/subscription.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sub-list',
  templateUrl: './sub-list.component.html',
})
export class SubListComponent implements OnInit {
  subscriptions: Subscription[] = [];
  searchQuery: string = '';

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit() {
    this.loadSubscriptions();
  }

  // Load all subscriptions from the service
  loadSubscriptions() {
    this.subscriptionService.getAll().subscribe(
      (data: Subscription[]) => {
        this.subscriptions = data;
      },
      (error) => {
        Swal.fire('Error', 'Failed to load subscriptions', 'error');
      }
    );
  }

 // Approve a subscription
approveSubscription(id: number) {
  Swal.fire({
    title: 'Approve Subscription',
    input: 'text',
    inputLabel: 'Remarks',
    inputPlaceholder: 'Enter approval remarks',
    showCancelButton: true,
    confirmButtonText: 'Approve',
  }).then((result) => {
    if (result.isConfirmed) {
      this.subscriptionService.approveSubscription(id, result.value || '').subscribe(
        () => {
          Swal.fire('Success', 'Subscription approved successfully', 'success');
          this.loadSubscriptions(); // Reload subscriptions
        },
        (error) => {
          Swal.fire('Error', 'Failed to approve subscription', 'error');
        }
      );
    }
  });
}

// Reject a subscription
rejectSubscription(id: number) {
  Swal.fire({
    title: 'Reject Subscription',
    input: 'text',
    inputLabel: 'Remarks',
    inputPlaceholder: 'Enter rejection remarks',
    showCancelButton: true,
    confirmButtonText: 'Reject',
  }).then((result) => {
    if (result.isConfirmed) {
      this.subscriptionService.rejectSubscription(id, result.value || '').subscribe(
        () => {
          Swal.fire('Success', 'Subscription rejected successfully', 'success');
          this.loadSubscriptions(); // Reload subscriptions
        },
        (error) => {
          Swal.fire('Error', 'Failed to reject subscription', 'error');
        }
      );
    }
  });
}
  // Getter for filtered subscriptions
  get filteredSubscriptions() {
    if (!this.searchQuery.trim()) {
      return this.subscriptions;
    }
    return this.subscriptions.filter((sub) =>
      sub.id.toString().includes(this.searchQuery.trim())
    );
  }

  showImage(imagePath: string) {
    const fullImageUrl = `http://localhost:4000/assets/${imagePath}`;
    Swal.fire({
      imageUrl: fullImageUrl,
      imageAlt: 'Subscription Receipt',
      title: 'Subscription Receipt',
      showCloseButton: true,
      showConfirmButton: false,
      imageWidth: '100%',
      imageHeight: 'auto',
    });
  }
  
}
