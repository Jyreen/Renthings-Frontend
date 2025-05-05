import { Component, OnInit } from '@angular/core';
import { Item } from '../_models/item';
import { ItemService } from '../_services/item.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailService } from '../_services/email.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
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
    private fb: FormBuilder,
    private router: Router
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

  async confirmAndRedirect() {
    const { value: accepted } = await Swal.fire({
      title: '🔐 Rental Terms & Conditions',
      input: 'checkbox',
      inputPlaceholder: `I have read and agree to the Terms & Conditions.`,
      html: `
        <div style="text-align: left; max-height: 300px; overflow-y: auto; font-size: 0.9rem; padding-right: 10px;">
          <p><strong>By proceeding, you agree to the following terms and conditions as a renter:</strong></p>
  
          <p><strong>1. ✅ Eligibility</strong><br>
          Only registered users with verified accounts may rent items.<br>
          Renters must be at least 18 years old, or have parental/guardian consent.</p>
  
          <p><strong>2. ⏱️ Rental Period & Return</strong><br>
          All rented items must be returned on or before the due date.<br>
          Failure to return on time may result in late fees or account suspension.<br>
          Early returns do not qualify for partial refunds unless otherwise stated.</p>
  
          <p><strong>3. 💳 Payment Terms</strong><br>
          Full rental fees must be paid before the item is released.<br>
          Payment includes rental cost, security deposit (if applicable), and any service charges.<br>
          Non-payment or chargebacks may result in permanent account suspension.</p>
  
          <p><strong>4. 🔧 Damage, Loss, & Responsibility</strong><br>
          The renter is fully responsible for the item during the rental period.<br>
          Any damages, losses, or thefts must be reported immediately.<br>
          Repair or replacement costs will be charged based on item condition.</p>
  
          <p><strong>5. 🔄 Cancellation Policy</strong><br>
          Cancellations must be made at least 24 hours before rental starts.<br>
          Late cancellations may not be refunded. No-shows are non-refundable and may result in penalties.</p>
  
          <p><strong>6. 🚫 Prohibited Uses</strong><br>
          Items must not be used for illegal, hazardous, or unethical activities.<br>
          Subleasing or unauthorized transfers are strictly prohibited.</p>
  
          <p><strong>7. 📄 Agreement & Enforcement</strong><br>
          Violations may result in fees, legal action, or account banning.<br>
          By clicking "Continue", you confirm that you have read, understood, and agreed to these terms.</p>
        </div>
      `,
      confirmButtonText: `Continue&nbsp;<i class="fa fa-arrow-right"></i>`,
      inputValidator: (result) => {
        return !result && 'You need to agree with the Terms & Conditions to proceed.';
      },
      width: 600
    });
  
    if (accepted) {
      this.router.navigate(['/list']);
    }
  }
}
