import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AccountService } from '../../_services';
import Swal from 'sweetalert2'; // Import SweetAlert

@Component({ templateUrl: 'edit.component.html' })
export class EditComponent implements OnInit {
    form: UntypedFormGroup;
    id: string;
    loading = false;
    submitted = false;
    originalFormValues: any; // Store original form values for comparison

    constructor(
        private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
    
        this.form = this.formBuilder.group({
            acc_firstName: ['', Validators.required],
            acc_lastName: ['', Validators.required],
            acc_email: ['', [Validators.required, Validators.email]],
            acc_role: ['', Validators.required],
            acc_status: ['', Validators.required], // Add this line
        });
    
        // Fetch existing account data to populate the form
        this.accountService.getById(this.id).pipe(first()).subscribe(account => {
            this.form.patchValue(account);
            this.originalFormValues = this.form.getRawValue(); // Save original form values
        });
    }
    

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // Stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        console.log("Form Values Before Update:", this.form.value);

        // Check if the form values have changed
        if (this.hasChanges()) {
            this.loading = true;
            this.updateAccount(); // Call the update method if changes are detected
        } else {
            // No changes detected, redirect to the list without showing an alert
            this.router.navigate(['../../'], { relativeTo: this.route });
        }
    }

    // Check if form values have changed compared to the original values
    private hasChanges(): boolean {
        const currentFormValues = this.form.getRawValue();
        return JSON.stringify(currentFormValues) !== JSON.stringify(this.originalFormValues);
    }

    private updateAccount() {
        
        this.accountService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    // SweetAlert for success if changes are made and update is successful
                    this.loading = true;
                    Swal.fire({
                        icon: 'success',
                        title: 'Update Successful',
                        text: 'The account has been updated successfully!',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // After the alert is dismissed, navigate back to the previous page
                        this.router.navigate(['../../'], { relativeTo: this.route });
                        this.loading = false;
                    });
                },
                error: (error: any) => {
          
                    const errorMessage = typeof error === 'string' ? error : 'An unexpected error occurred.';
                    // Display SweetAlert with the error message
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: errorMessage, // Directly show the string error
                        confirmButtonText: 'OK',
                    });
                    this.loading = false; // Stop the loading spinner
                }
            });
    }

    // Method to handle back navigation
    goBack() {
        this.router.navigate(['/admin/accounts'], { relativeTo: this.route });
    }
}