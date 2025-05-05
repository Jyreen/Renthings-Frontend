import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import Swal from 'sweetalert2'; // Import SweetAlert

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      acc_email: ['', [Validators.required, Validators.email]],
      acc_passwordHash: ['', Validators.required],
    });
  }

  // Getter for form fields
  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const { acc_email, acc_passwordHash } = this.form.value;

    this.accountService.login(acc_email, acc_passwordHash).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'Welcome back!',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          // Display full business rules
          Swal.fire({
            icon: 'info',
            title: '📜 Platform Business Rules & Guidelines',
            html: `
              <div style="text-align:left; max-height:400px; overflow-y:auto; padding-right:10px;">
                <p><b> 1. Only List What You Own</b><br>
                You must be the rightful owner of any item you list for rent.</p>
  
                <p><b> 2. Provide Accurate Item Details</b><br>
                Include honest and complete descriptions, clear photos, and set fair pricing.</p>
  
                <p><b> 3. Keep Your Listings Updated</b><br>
                Mark items as unavailable if they are no longer for rent.</p>
  
                <p><b> 4. Rent Responsibly</b><br>
                Return items on or before the due date, in the condition they were received.</p>
  
                <p><b> 5. Inspect Before You Rent</b><br>
                We recommend checking the item’s condition before confirming any rental.</p>
  
                <p><b> 6. Handle Items with Care</b><br>
                Damages caused during the rental period may be subject to penalties.</p>
  
                <p><b> 7. Report Any Issues Immediately</b><br>
                Contact support if something goes wrong with your rental.</p>
  
                <p><b> 8. No Illegal or Restricted Items</b><br>
                Listings must follow our content policy. Banned items will be removed.</p>
  
                <p><b> 9. Respect User Privacy</b><br>
                Use contact information only for rental purposes.</p>
  
                <p><b> 10. Payments & Refunds</b><br>
                Follow platform payment procedures. Refunds may vary depending on item owner policies.</p>
              </div>
            `,
            confirmButtonText: 'Got it!',
            width: 600,
            allowOutsideClick: false,
          }).then(() => {
            // Redirect based on role
            if (this.accountService.accountValue.acc_role === 'Admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/home']);
            }
          });
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password. Please try again.',
        });
        console.error(error);
        this.loading = false;
      },
    });
  }
}
