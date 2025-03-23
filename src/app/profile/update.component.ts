import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '../_services/account.service';
import { MustMatch } from '../_helpers/must-match.validator';

@Component({
  templateUrl: 'update.component.html',
})
export class UpdateComponent implements OnInit {
  account = this.accountService.accountValue;
  form!: FormGroup;
  loading = false;
  submitted = false;
  previewImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        acc_firstName: [this.account.acc_firstName, Validators.required],
        acc_lastName: [this.account.acc_lastName, Validators.required],
        acc_email: [this.account.acc_email, [Validators.required, Validators.email]],
        acc_passwordHash: ['', [Validators.minLength(6)]],
        confirmPassword: [''],
        acc_image: [this.account.acc_image], // Add image field
      },
      
      {
        validator: MustMatch('acc_passwordHash', 'confirmPassword'),
      }
    );

    // Set initial profile image preview
    this.previewImage = this.account.acc_image
      ? `http://localhost:4000/assets/${this.account.acc_image}`
      : 'assets/default-profile.png';
  }

  // Convenience getter for form fields
  get f() {
    return this.form.controls;
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file); // Debugging
      this.selectedFile = file;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target?.result;
        console.log('Preview Image URL:', this.previewImage); // Debugging
      };
      reader.readAsDataURL(file);
    }
  }
  

  onSubmit() {
    this.submitted = true;
  
    if (this.form.invalid) {
      return;
    }
  
    this.loading = true;
    const formData = new FormData();
    formData.append('acc_firstName', this.form.value.acc_firstName);
    formData.append('acc_lastName', this.form.value.acc_lastName);
    formData.append('acc_email', this.form.value.acc_email);
  
    if (this.form.value.acc_passwordHash) {
      formData.append('acc_passwordHash', this.form.value.acc_passwordHash);
    }
  
    if (this.selectedFile) {
      console.log('Uploading file:', this.selectedFile); // Debugging
      formData.append('acc_image', this.selectedFile);
    } else {
      console.log('No file selected'); // Debugging
    }
  
    this.accountService.update(this.account.id, formData)
      .pipe(first())
      .subscribe({
        next: () => {
          alert('Update successful');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (error) => {
          alert(error);
          this.loading = false;
        },
      });
  }  
  
}
