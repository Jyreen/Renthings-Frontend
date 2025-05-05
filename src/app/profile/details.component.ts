import { Component } from '@angular/core';
import { AccountService } from '../_services';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';


@Component({ templateUrl: 'details.component.html' })
export class DetailsComponent {
    account = this.accountService.accountValue;
    selectedFile: File | null = null;
    showModal = false; // modal visibility
  
    constructor(private accountService: AccountService) {}
  
    openModal() {
      console.log('openModal called');
      this.showModal = true;
    }
    
  
    closeModal() {
      this.showModal = false;
      this.selectedFile = null;
    }
  
    onFileSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        this.selectedFile = input.files[0];
      }
    }
  
    submitVerification() {
      if (!this.selectedFile) {
        alert('Please select a file before submitting.');
        return;
      }
  
      const formData = new FormData();
      formData.append('verification_images', this.selectedFile);
  
      this.accountService.uploadVerificationImages(+this.account.id, [this.selectedFile])
      .subscribe({
        next: (res) => {
          // SweetAlert for successful submission
          Swal.fire({
            icon: 'success',
            title: 'Verification Image Submitted!',
            text: 'Your verification image has been successfully submitted.',
          });
          this.closeModal();
        },
        error: (err) => {
          // SweetAlert for failed upload
          Swal.fire({
            icon: 'error',
            title: 'Failed to Upload',
            text: 'There was an error uploading the verification image. Please try again.',
          });
        }
      });
    }
  }
