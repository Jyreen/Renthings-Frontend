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
          if(this.accountService.accountValue.acc_role == "Admin"){
            this.router.navigate(['/admin']); 
          } else {
            this.router.navigate(['/home']); // Redirect to the home page
          }
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
