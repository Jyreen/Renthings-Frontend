import { Component, OnInit, Input } from '@angular/core';
import { RentItemService } from '../_services/rent-items.service';
import { ChatService } from '../_services/chat.service';
import iziToast from 'izitoast';
import { ActivatedRoute } from '@angular/router';
import { RentItem } from '../_models';

@Component({
    selector: 'app-view-renters',
    templateUrl: './view-renters.component.html',
    styleUrls: ['./view-renters.component.css']
  })  
export class ViewRentersComponent implements OnInit {
  itemId: number; // Item ID passed from the parent component
  renters: RentItem[] = [];

  constructor(
    private rentItemService: RentItemService,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      console.log('Route parameters:', params); // Debugging log
  
      if (params['itemId']) {  // Use 'itemId' instead of 'id'
        this.itemId = Number(params['itemId']); // Convert to number safely
  
        if (!isNaN(this.itemId)) {
          console.log('Extracted itemId from route:', this.itemId);
          this.fetchRenters();
        } else {
          console.error('Invalid itemId: Not a number', params['itemId']);
        }
      } else {
        console.warn('itemId is missing from route parameters.');
      }
    });
  }
  
  fetchRenters(): void {
    console.log('Fetching renters for itemId:', this.itemId);
  
    this.rentItemService.getRentersByItemId(this.itemId).subscribe(
      (response: any[]) => {
        console.log('API Response:', response);
  
        if (Array.isArray(response)) {
          this.renters = response.map(rent => ({
            ...rent,
            renter: rent.renter || {} // Ensure renter is always an object
          }));
        } else {
          this.renters = [];
        }
  
        console.log('Final Renters List:', this.renters);
      },
      (error) => {
        console.error('Error fetching renters:', error);
        iziToast.error({
          title: 'Error',
          message: 'Failed to load renters.',
          position: 'topRight',
        });
      }
    );
  }
  
  

  // Send message to renter
  sendMessage(renterId: number): void {
    const message = prompt('Enter your message:');
    if (!message) return;

    this.chatService.sendMessage(renterId, message).subscribe(
      () => {
        iziToast.success({
          title: 'Success',
          message: 'Message sent successfully!',
          position: 'bottomRight',
        });
      },
      (error) => {
        console.error('Error sending message:', error);
        iziToast.error({
          title: 'Error',
          message: 'Failed to send message.',
          position: 'topRight',
        });
      }
    );
  }

  // Approve rental request
  approveRental(rentalId: number): void {
    this.rentItemService.approveRental(rentalId).subscribe(
      () => {
        iziToast.success({
          title: 'Success',
          message: 'Rental request approved!',
          position: 'bottomRight',
        });
        this.fetchRenters(); // Refresh list after approval
      },
      (error) => {
        console.error('Error approving rental:', error);
        iziToast.error({
          title: 'Error',
          message: 'Failed to approve rental.',
          position: 'topRight',
        });
      }
    );
  }
}
