import { Component, OnInit } from '@angular/core';
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
  itemId: number;
  renters: RentItem[] = [];
  loadingId: number | null = null; // Track which button is loading
  selectedImage: string | null = null;

  isSendingMessage: { [key: number]: boolean } = {}; // Tracks loading state per renter
  isApprovingRental: { [key: number]: boolean } = {}; // Tracks loading state per rental

  constructor(
    private rentItemService: RentItemService,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['itemId']) {
        this.itemId = Number(params['itemId']);
        if (!isNaN(this.itemId)) {
          this.fetchRenters();
        }
      }
    });
  }
  
  fetchRenters(): void {
    this.rentItemService.getRentersByItemId(this.itemId).subscribe(
      (response: any[]) => {
        this.renters = response.map(rent => ({
          ...rent,
          renter: rent.renter || {}
        }));
      },
      (error) => {
        iziToast.error({
          title: 'Error',
          message: 'Failed to load renters.',
          position: 'topRight',
        });
      }
    );
  }

  sendMessage(renterId: number): void {
    const message = prompt('Enter your message:');
    if (!message) return;

    this.isSendingMessage[renterId] = true; // Start loading
    
    this.chatService.sendMessage(renterId, message).subscribe(
      () => {
        iziToast.success({
          title: 'Success',
          message: 'Message sent successfully!',
          position: 'bottomRight',
        });
      },
      () => {
        iziToast.error({
          title: 'Error',
          message: 'Failed to send message.',
          position: 'topRight',
        });
      }
    ).add(() => {
      this.isSendingMessage[renterId] = false; // Stop loading
    });
  }

  approveRental(rentalId: number): void {
    this.isApprovingRental[rentalId] = true; // Start loading
    
    this.rentItemService.approveRental(rentalId).subscribe(
      () => {
        iziToast.success({
          title: 'Success',
          message: 'Rental request approved!',
          position: 'bottomRight',
        });
        this.fetchRenters();
      },
      () => {
        iziToast.error({
          title: 'Error',
          message: 'Failed to approve rental.',
          position: 'topRight',
        });
      }
    ).add(() => {
      this.isApprovingRental[rentalId] = false; // Stop loading
    });
  }
  openImageModal(image: string) {
    console.log('Opening modal for image:', image);
    this.selectedImage = image;
  }
  
  closeImageModal() {
    this.selectedImage = null;
  }

  markAsCompleted(rentItemId: number): void {
    this.loadingId = rentItemId; // Set loading state
    
    this.rentItemService.markAsCompleted(rentItemId).subscribe(
      () => {
        iziToast.success({ 
          title: 'Success', 
          message: 'Rental marked as completed!', 
          position: 'bottomRight' 
        });
        this.fetchRenters(); // Refresh the list
      },
      (error) => {
        iziToast.error({ 
          title: 'Error', 
          message: error.error?.message || 'Failed to mark as completed.', 
          position: 'topRight' 
        });
      }
    ).add(() => {
      this.loadingId = null; // Reset loading state
    });
  }
}
