import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';


import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../_services/item.service'; // Your service to fetch item details
import { ChatService } from '../_services/chat.service'; // Chat service for sending messages
import iziToast from 'izitoast';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
})
export class ItemDetailsComponent implements OnInit{
  item: any; // Store the fetched item
  itemId: number; // Store the item ID from the route
  loggedInUserId: number = 1; // Assume logged-in user ID. Replace with real logic.
  isModalOpen: boolean = false; // Modal visibility flag
  message: string = ''; // The message the user will send


  // Rent variables
  isRentModalOpen: boolean = false; // Rent modal visibility flag
  startDate: Date | null = null; // Start date for rent
  endDate: Date | null = null; // End date for rent


  
  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private chatService: ChatService, // Inject ChatService for messaging
    private router: Router // To navigate to the messages component after sending the message
  ) {}

  ngOnInit(): void {
    // Get the 'id' parameter from the route
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

    if (this.startDate > this.endDate) {
      iziToast.error({
        title: 'Error',
        message: 'Start date cannot be after the end date.',
        position: 'topRight',
      });
      return;
    }

    // Example API call for rent functionality
    console.log('Rent confirmed', {
      startDate: this.startDate,
      endDate: this.endDate,
    });

    iziToast.success({
      title: 'Success',
      message: 'Item rented successfully!',
      position: 'bottomRight',
    });

    this.closeRentModal(); // Close the modal after confirmation
  }

}
