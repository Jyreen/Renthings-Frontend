import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemService, SubscriptionService } from '../_services';
import { AccountService } from '../_services/account.service';
import Swal from 'sweetalert2'; // SweetAlert for feedback
import { Item } from '../_models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.css']
})
export class ListItemComponent implements OnInit {
  createItemForm: FormGroup;
  updateItemForm: FormGroup;
  selectedFiles: File[] | null = null;
  imagePreviews: string[] = [];
  loading = false;
  items: any[] = [];
  accountId: string | null = null;
  
  // Modal states
  showCreateModal = false;
  showUpdateModal = false;
  currentItem: any = null; // To store the item being edited
  
  currentItemId: number | null = null;

  showSubscriptionModal = false;
  showPaymentModal = false;


  subscriptionDuration: number = 0;
  subscriptionAmount: number = 0;

  receiptFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private accountService: AccountService,
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {
    // Initialize forms
    this.createItemForm = this.formBuilder.group({
      Item_name: ['', Validators.required],
      Item_Description: ['', Validators.required],
      Item_price: ['', Validators.required]
    });

    this.updateItemForm = this.formBuilder.group({
      Item_name: ['', Validators.required],
      Item_Description: ['', Validators.required],
      Item_price: ['', Validators.required]
    });
  }

  /**
   * Open the payment modal for a specific subscription plan.
   * @param duration Subscription duration in months
   * @param amount Subscription amount
   */
  openPaymentModal(duration: number, amount: number): void {
    this.subscriptionDuration = duration;
    this.subscriptionAmount = amount;

    console.log("Sub Duration: ",this.subscriptionDuration)

    this.showSubscriptionModal = false;
    this.showPaymentModal = true;
  }

  /**
   * Close the payment modal.
   */
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.showSubscriptionModal = true;
  }

  /**
   * Handle receipt file upload.
   * @param event File input change event
   */
  handleReceiptUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.receiptFile = file;
      console.log('Receipt uploaded:', file);
    }
  }

  /**
   * Submit the payment receipt.
   */
  submitPayment(): void {

    if (!this.receiptFile) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Receipt',
        text: 'Please upload your GCash receipt before submitting.',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    if (!this.subscriptionDuration || !this.subscriptionAmount || !this.accountId) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Details',
        text: 'Subscription details are incomplete. Please try again.',
        confirmButtonText: 'OK',
      });
      
      

      return;
    }
  
    const formData = new FormData();
    formData.append('acc_id', this.accountId); // Add account ID
    if(this.subscriptionDuration == 1){
      formData.append('subscription_plan', `${this.subscriptionDuration}_month`);
    } else {
      formData.append('subscription_plan', `${this.subscriptionDuration}_months`); 
    }
    formData.append('start_date', new Date().toISOString()); // Add current date
    formData.append('subscription_receipt', this.receiptFile); // Add receipt file
  
    this.loading = true;
    
    // Use the subscription service to send the form data
    this.subscriptionService.create(formData).subscribe(
      (response) => {
        this.loading = false;
        this.closePaymentModal();
  
        this.showSubscriptionModal = false;

        Swal.fire({
          icon: 'success',
          title: 'Payment Submitted',
          text: 'Your payment has been submitted successfully! It will be reviewed by the admin.',
          confirmButtonText: 'OK',
        });
      },
      (error) => {
        this.loading = false;
  
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: error.message || 'An error occurred while submitting your payment. Please try again later.',
          confirmButtonText: 'OK',
        });
      }
    );
  }
  
  
  ngOnInit(): void {
    // Get the current user's account ID and fetch their listings
    const account = this.accountService.accountValue;
    this.accountId = account?.id || '';
    this.fetchUserListings();
  }

  /**
   * Fetch all items belonging to the current user.
   */
  fetchUserListings(): void {
    if (!this.accountId) {
      console.error('Account ID is not available.');
      return;
    }
  
    this.itemService.getByAccountId(Number(this.accountId)).subscribe(
      (response) => {
        this.items = response;
  
        // Check if user has an active subscription before showing the prompt
        if (this.items.length >= 2 && this.accountService.accountValue?.acc_subscription !== 'active') {
          this.showSubscriptionPrompt();
        }
      },
      (error) => {
        console.error('Error fetching user listings:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Fetch Listings',
          text: 'There was an error fetching your listings. Please try again later.',
          confirmButtonText: 'OK'
        });
      }
    );
  }
  

  showSubscriptionPrompt(): void {
    Swal.fire({
      title: 'Subscription Required',
      text: 'You have reached the limit of 2 items. Please subscribe to unlock more items.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Subscribe Now',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Open the subscription modal
        this.openSubscriptionModal();
      }
    });
  }


  openSubscriptionModal(): void {
    this.showSubscriptionModal = true;
  }

  closeSubscriptionModal(): void {
    this.showSubscriptionModal = false;
  }

  subscribe(months: number): void {
    console.log(`Subscribed for ${months} months`);

    // Perform subscription logic here (e.g., save subscription to database)

    // Close modal after subscription
    this.closeSubscriptionModal();
    
    Swal.fire({
      icon: 'success',
      title: 'Subscription Successful',
      text: `You have subscribed for ${months} months.`,
      confirmButtonText: 'OK'
    });
  }


  viewRenters(itemId: number): void {
    this.router.navigate(['/view-renters', itemId]);
  }


  /**
   * Handle file input changes and generate image previews.
   */
  handleFileInput(event: any): void {
    this.selectedFiles = event.target.files;
    this.imagePreviews = [];

    if (this.selectedFiles) {
      for (const file of this.selectedFiles) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          if (e.target?.result) {
            this.imagePreviews.push(e.target.result as string);
          }
        };
        fileReader.readAsDataURL(file);
      }
    }
  }

  /**
   * Open the Create Item modal.
   */
  openCreateModal(): void {

    if(this.items.length == 2 && this.accountService.accountValue.acc_subscription == 'disabled'){
      this.fetchUserListings();
    } else {
      this.showCreateModal = true;
    }
    this.resetForm(this.createItemForm);
  }

  /**
   * Close the Create Item modal.
   */
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm(this.createItemForm);
  }

  /**
   * Open the Update Item modal with the selected item's details.
   */
  openUpdateModal(item: any): void {
    this.showUpdateModal = true;
    this.currentItemId = item.Item_id; // Store the ID of the item being updated
    this.updateItemForm.patchValue({
      Item_name: item.Item_name,
      Item_Description: item.Item_Description,
      Item_price: item.Item_price,
      // You don't need to patch the image here
    });
  }

  /**
   * Close the Update Item modal.
   */
  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.resetForm(this.updateItemForm);
    this.currentItem = null;
  }

  /**
   * Reset a form and clear image previews.
   */
  resetForm(form: FormGroup): void {
    form.reset();
    this.selectedFiles = null;
    this.imagePreviews = [];
  }

  /**
   * Create a new item.
   */
  createItem(): void {
    if (this.createItemForm.invalid || !this.accountId) {
      return;
    }

    this.loading = true;

    const formData = this.prepareFormData(this.createItemForm);

    this.itemService.create(formData).subscribe(
      () => {
        this.loading = false;
        this.closeCreateModal();
        this.fetchUserListings();

        Swal.fire({
          icon: 'success',
          title: 'Item Created',
          text: 'Your item has been created successfully!',
          confirmButtonText: 'OK'
        });
      },
      (error) => this.handleError('Item Creation Failed', error)
    );
  }

  /**
   * Update an existing item.
   */
  updateItem(): void {
    if (this.updateItemForm.invalid) {
      return;
    }
  
    const updatedItem: Partial<Item> = {
      Item_name: this.updateItemForm.get('Item_name')?.value,
      Item_Description: this.updateItemForm.get('Item_Description')?.value,
      Item_price: this.updateItemForm.get('Item_price')?.value,
    };
  
    const itemImage: File | undefined = this.selectedFiles ? this.selectedFiles[0] : undefined;
  
    if (this.currentItemId) {
      this.itemService.update(this.currentItemId, updatedItem, itemImage).subscribe(
        (response) => {
          this.fetchUserListings(); // Refresh the item list
          this.closeUpdateModal();
  
          Swal.fire({
            icon: 'success',
            title: 'Item Updated',
            text: 'Your item has been updated successfully!',
            confirmButtonText: 'OK',
          });
        },
        (error) => {
          console.error('Update failed:', error);
  
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'There was an error updating your item. Please try again.',
            confirmButtonText: 'OK',
          });
        }
      );
    }
  }
  

  /**
   * Delete an item after confirmation.
   */
  deleteItem(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to undo this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.itemService.delete(id).subscribe(
          () => {
            this.items = this.items.filter(item => item.Item_id !== id); // Update the items list
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Your item has been successfully deleted.',
              confirmButtonText: 'OK'
            });
          },
          (error) => {
            console.error('Delete failed:', error);
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: 'There was an error deleting your item. Please try again.',
              confirmButtonText: 'OK'
            });
          }
        );
      }
    });
  }
  

  /**
   * Prepare form data for submission.
   */
  private prepareFormData(form: FormGroup): FormData {
    const formData = new FormData();
    Object.keys(form.controls).forEach((key) => {
      const value = form.get(key)?.value;
      if (value) {
        formData.append(key, value);
      }
    });

    if (this.selectedFiles) {
      for (const file of this.selectedFiles) {
        formData.append('Item_image', file, file.name);
      }
    }

    if (this.accountId) {
      formData.append('acc_id', this.accountId);
    }

    return formData;
  }

  /**
   * Handle errors and show feedback to the user.
   */
  private handleError(title: string, error: any): void {
    console.error(title, error);
    this.loading = false;

    Swal.fire({
      icon: 'error',
      title,
      text: error.message || 'An unknown error occurred. Please try again later.',
      confirmButtonText: 'OK'
    });
  }
}
