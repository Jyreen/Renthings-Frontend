import { Component, OnInit } from '@angular/core';
import { AccountService, RentItemService } from '../_services';
import { RentItem } from '../_models/rent-items';
import { FeedbackService } from '../_services/feedback.service';
import iziToast from 'izitoast';
import { Feedback } from '../_models';

@Component({
  selector: 'app-item-history',
  templateUrl: './item-history.component.html',
})
export class ItemHistoryComponent implements OnInit {
  itemHistories: RentItem[] = [];
  accountId = 0;
  isFeedbackModalOpen: boolean = false;

  selectedRentItem: RentItem | null = null;
  
  feedback: Feedback = { RentItem_id: 0, acc_id: 0, rating: 5, comment: '' };

  constructor(
    private rentItemService: RentItemService,
    private accountService: AccountService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.loadItemHistory();
  }

  loadItemHistory(): void {
    this.accountId = Number(this.accountService.accountValue.id);
    this.rentItemService.getRentalsByAccountId(this.accountId).subscribe({
      next: (data) => {
        this.itemHistories = data;
      },
      error: (err) => {
        console.error('Error fetching item history', err);
      },
    });
  }

  openFeedbackModal(rentItem: RentItem): void {
    this.selectedRentItem = rentItem;
    this.isFeedbackModalOpen = true;
    this.feedback = { RentItem_id: rentItem.RentItem_id, acc_id: this.accountId, rating: 5, comment: '' };
  }

  closeFeedbackModal(): void {
    this.isFeedbackModalOpen = false;
  }

  submitFeedback(): void {
    console.log('submitting:',this.feedback);
    this.feedbackService.create(this.feedback).subscribe(
      () => {
        iziToast.success({ title: 'Success', message: 'Feedback submitted!', position: 'bottomRight' });
        this.closeFeedbackModal();
      },
      (error) => {
        console.error('Full error response:', error); // Ensure we log it for debugging
  
        iziToast.error({
          title: 'Error',
          message: error || 'Failed to submit feedback.', // Directly show backend error
          position: 'topRight',
        });
      }
    );
  }
}
