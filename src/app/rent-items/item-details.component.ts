import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../_services/item.service'; // Your service to fetch item details
import { ChatService } from '../_services/chat.service'; // Chat service for sending messages
import { RentItemService } from '../_services/rent-items.service';
import { AccountService, FeedbackService } from '../_services';
import { Feedback } from '../_models';
import iziToast from 'izitoast';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
})
export class ItemDetailsComponent implements OnInit{
  item: any; // Store the fetched item
  itemId: number; // Store the item ID from the route
  loggedInUserId: string; // Assume logged-in user ID. Replace with real logic.
  isModalOpen: boolean = false; // Modal visibility flag
  message: string = ''; // The message the user will send
  totalPrice: number = 0;
  feedbacks: Feedback[] = [];
  averageRating: number = 0;

  // Rent variables
  isRentModalOpen: boolean = false; // Rent modal visibility flag
  startDate: Date | null = null; // Start date for rent
  endDate: Date | null = null; // End date for rent

  // Spinner
  isSendingMessage: boolean = false;
  isRenting: boolean = false;

  
  constructor(
    private route: ActivatedRoute,
    private rentItemService: RentItemService,
    private itemService: ItemService,
    private accountService: AccountService,
    private chatService: ChatService, // Inject ChatService for messaging
    private router: Router, 
    private feedbackService: FeedbackService // To navigate to the messages component after sending the message
  ) {}

  ngOnInit(): void {
    // Get the 'id' parameter from the route
    this.loggedInUserId = this.accountService.accountValue?.id;

    this.route.params.subscribe((params) => {
      this.itemId = +params['id']; // Ensure 'id' is a number
      if (this.itemId) {
        this.fetchItem();
      } else {
        console.error('Item ID is undefined or invalid');
      }
    });
  }

  getFeedbacks(): void {
    this.feedbackService.getByItemId(this.itemId).subscribe((data) => {
      this.feedbacks = data;
      this.calculateAverageRating();
    });
  }

  calculateAverageRating(): void {
    if (this.feedbacks.length > 0) {
      const totalStars = this.feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      this.averageRating = totalStars / this.feedbacks.length;
    }
  }

  fetchItem(): void {
    this.itemService.getById(this.itemId).subscribe(
      (item) => {
        this.item = item; // Assign the fetched item to the component variable
        this.getFeedbacks();
      },
      (error) => {
        console.error('Error fetching item:', error);
      }
    );
  }

  openMessageModal(): void {
    console.log('Opening message modal');  // This will appear in the console when the button is clicked
    this.isModalOpen = true;
  }
  
  calculateTotalPrice(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      
      const timeDiff = end.getTime() - start.getTime();
      const dayCount = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  
      if (dayCount > 0) {
        this.totalPrice = dayCount * this.item.Item_price;
      } else {
        this.totalPrice = 0;
      }
    } else {
      this.totalPrice = 0;
    }
  }
  

  // Close the message modal
  closeMessageModal(): void {
    this.isModalOpen = false;
    this.message = ''; // Reset the message
  }

  // Send the message to the item owner
  sendMessage(): void {
    if (!this.item || !this.item.acc_id) {
      iziToast.error({
        title: 'Error',
        message: 'Unable to determine the item owner.',
        position: 'topRight',
      });
      return;
    }
  
    this.isSendingMessage = true; // Start loading
    const receiverId = this.item.acc_id; // Get owner's acc_id from item details
  
    // Send the message using the ChatService
    this.chatService.sendMessage(receiverId, this.message).subscribe(
      (sentMessage) => {
        iziToast.success({
          title: 'Message Sent',
          message: 'Your message has been sent to the item owner.',
          position: 'bottomRight',
        });
        this.closeMessageModal(); // Close modal after sending
  
        // Redirect to the conversation page
        this.router.navigate(['/message']);
      },
      (err) => {
        iziToast.error({
          title: 'Error',
          message: 'Failed to send message.',
          position: 'topRight',
        });
        console.error('Error sending message:', err);
      }
    ).add(() => {
      this.isSendingMessage = false; // Stop loading
    });
  }

  async confirmAndRedirect() {
    const { value: accepted } = await Swal.fire({
      title: '📄 Renter’s Agreement & Guidelines',
      input: 'checkbox',
      inputPlaceholder: `I have read and agree to the Renter’s Rules and Conditions.`,
      html: `
        <div style="text-align: left; max-height: 300px; overflow-y: auto; font-size: 0.9rem; padding-right: 10px;">
          <p><strong>By renting an item on this platform, you agree to the following:</strong></p>
  
          <p><strong>1. 🔐 Verified Users Only</strong><br>
          Only verified users may initiate rentals. Your profile must be complete and accurate.</p>
  
          <p><strong>2. ⏰ Respect the Rental Period</strong><br>
          Always return items on or before the agreed due date.<br>
          Late returns may result in penalties, additional charges, or account restrictions.</p>
  
          <p><strong>3. 💰 Pay Before You Play</strong><br>
          Rentals must be fully paid in advance, including any required deposit.<br>
          Confirmed bookings are final unless canceled within policy timeframes.</p>
  
          <p><strong>4. 🧼 Treat Items with Care</strong><br>
          You are responsible for maintaining the item’s condition.<br>
          Lost or damaged items will incur repair/replacement costs based on assessment.</p>
  
          <p><strong>5. 🛑 Respect Owner's Rules</strong><br>
          Follow any special care instructions or limitations provided by the item owner.<br>
          Abuse or misuse may result in being reported and penalized.</p>
  
          <p><strong>6. ⚠️ No Unauthorized Use</strong><br>
          Do not use rented items for illegal, unsafe, or third-party use.<br>
          Sub-renting or transferring items to others is strictly prohibited.</p>
  
          <p><strong>7. 🗣 Report Problems Immediately</strong><br>
          If the item arrives damaged or not as described, contact support or the owner right away.<br>
          Silence may affect your refund eligibility or credibility on the platform.</p>
  
          <p><strong>8. 📜 Agreement Enforcement</strong><br>
          Any violation may result in temporary bans, permanent account suspension, or legal actions.</p>
        </div>
      `,
      confirmButtonText: `Continue&nbsp;<i class="fa fa-arrow-right"></i>`,
      inputValidator: (result) => {
        return !result && 'You must accept the Renter’s Agreement to proceed.';
      },
      width: 600
    });
  
    if (accepted) {
      this.isRentModalOpen = true;
    }
  }  
    
  // Open the rent modal
  openRentModal(): void {
    this.confirmAndRedirect()
  }

  // Close the rent modal
  closeRentModal(): void {
    this.isRentModalOpen = false;
    this.startDate = null;
    this.endDate = null;
  }

  // Confirm rent action
  confirmRent(): void {
    if (!this.startDate || !this.endDate) {
      iziToast.error({
        title: 'Error',
        message: 'Please select both start and end dates.',
        position: 'topRight',
      });
      return;
    }

    if (this.startDate > this.endDate) {
      iziToast.error({
        title: 'Error',
        message: 'Start date cannot be after the end date.',
        position: 'topRight',
      });
      return;
    }
  
    this.isRenting = true; // Start loading

    console.log("itemId:", this.itemId);
console.log("loggedInUserId:", this.loggedInUserId);
console.log("startDate:", this.startDate);
console.log("endDate:", this.endDate);

const rentData = {
  Item_id: this.itemId,
  renter_acc_id: this.loggedInUserId,
  rental_start_date: this.startDate.toISOString(),
  rental_end_date: this.endDate.toISOString(),
};

this.rentItemService.create(rentData).subscribe(
  (response) => {
    iziToast.success({
      title: 'Success',
      message: 'Item rented successfully!',
      position: 'bottomRight',
    });
    this.closeRentModal();
  },
  (error) => {
    // Determine the error message
    let errorMessage = 'Failed to rent item.';
    
    if (typeof error === 'string') {
      errorMessage = error; // If error is a string
    } else if (error.error?.message) {
      errorMessage = error.error.message; // For HttpErrorResponse
    } else if (error.message) {
      errorMessage = error.message; // Fallback to generic error message
    }
    
    iziToast.error({
      title: 'Error',
      message: errorMessage,
      position: 'topRight',
    });
    console.error('Error renting item:', error);
  }
).add(() => {
  this.isRenting = false;
});
  }
  
}
