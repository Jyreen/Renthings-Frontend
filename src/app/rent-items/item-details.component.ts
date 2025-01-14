import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../_services/item.service'; // Your service to fetch item details
import { ChatService } from '../_services/chat.service'; // Chat service for sending messages
import iziToast from 'izitoast';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
})
export class ItemDetailsComponent implements OnInit {
  item: any; // Store the fetched item
  itemId: number; // Store the item ID from the route
  loggedInUserId: number = 1; // Assume logged-in user ID. Replace with real logic.
  isModalOpen: boolean = false; // Modal visibility flag
  message: string = ''; // The message the user will send

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
}
