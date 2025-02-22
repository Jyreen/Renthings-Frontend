import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../_services/item.service'; // Your service to fetch item details
import { ChatService } from '../_services/chat.service'; // Chat service for sending messages
import { RentItemService } from '../_services/rent-items.service';
import { AccountService } from '../_services/account.service';
import iziToast from 'izitoast';

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
  verificationImage: File | null = null;

  // Rent variables
  isRentModalOpen: boolean = false; // Rent modal visibility flag
  startDate: Date | null = null; // Start date for rent
  endDate: Date | null = null; // End date for rent


  
  constructor(
    private route: ActivatedRoute,
    private rentItemService: RentItemService,
    private itemService: ItemService,
    private accountService: AccountService,
    private chatService: ChatService, // Inject ChatService for messaging
    private router: Router // To navigate to the messages component after sending the message
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

  fetchItem(): void {
    this.itemService.getById(this.itemId).subscribe(
      (item) => {
        this.item = item; // Assign the fetched item to the component variable
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
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.verificationImage = input.files[0];
    }
  }

  // Open the rent modal
  openRentModal(): void {
    this.isRentModalOpen = true;
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
  
    if (!this.verificationImage) {
      iziToast.error({
        title: 'Error',
        message: 'Please upload a verification image.',
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
  
    const formData = new FormData();
    formData.append('Item_id', this.itemId.toString());
    formData.append('renter_acc_id', this.loggedInUserId.toString());
    formData.append('rental_start_date', this.startDate.toISOString());
    formData.append('rental_end_date', this.endDate.toISOString());
    formData.append('verification_image', this.verificationImage);
  
    this.rentItemService.create(formData).subscribe(
      (response) => {
        iziToast.success({
          title: 'Success',
          message: 'Item rented successfully!',
          position: 'bottomRight',
        });
        this.closeRentModal();
      },
      (error) => {
        iziToast.error({
          title: 'Error',
          message: 'Failed to rent item.',
          position: 'topRight',
        });
        console.error('Error renting item:', error);
      }
    );
  }
  
}
