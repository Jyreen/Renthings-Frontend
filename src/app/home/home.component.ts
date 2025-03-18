import { Component, OnInit } from '@angular/core';
import { Item } from '../_models/item';
import { ItemService } from '../_services/item.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailService } from '../_services/email.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  approvedItems: Item[] = [];

  subscribeForm: FormGroup;

  constructor(
    private itemService: ItemService,
    private emailService: EmailService,
    private fb: FormBuilder
  ) {
    this.subscribeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  ngOnInit(): void {
    this.loadApprovedItems();
  }

  loadApprovedItems(): void {
    this.itemService.getApprovedItems().subscribe(
      (items) => {
        console.log("Approved Items:", items);  // Debugging: Check if data is received
        this.approvedItems = items;
      },
      (error) => console.error("Failed to fetch approved items", error)
    );
  }


  onSubmit() {
    if (this.subscribeForm.valid) {
      const email = this.subscribeForm.value.email;
      
      this.emailService.sendEmail(email).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Thank you! Stay tuned for the updates!'
          }).then(() => window.location.reload());
        },
        error: (err) => {
          console.error('Error!', err);
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong!',
            text: 'Please try again later.'
          });
        }
      });
    }
  }
}
