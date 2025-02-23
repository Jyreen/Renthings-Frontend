import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { AccountService } from '../../_services/account.service'
import { Account } from '../../_models'
import Swal from 'sweetalert2'; // Import SweetAlert
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    accounts: Account[] = [];
    searchQuery: string = '';

    currentAccount: Account = {
        id: '',
        acc_email: '',
        acc_passwordHash: '',
        acc_firstName: '',
        acc_lastName: '',
        acc_address: '',
        acc_role: null,
        acc_acceptTerms: '',
        acc_image: '',
        acc_status: '',
        acc_subscription:''
    };
    isEditing = false;
    showDetailsModal = false;
    account: any;


    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.loadAccounts();
    }

    loadAccounts() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(accounts => this.accounts = accounts);
    }

    get filteredAccounts(): Account[] {
        if (!this.searchQuery.trim()) {
          return this.accounts;
        }
        
        const lowerQuery = this.searchQuery.toLowerCase();
        const filtered = this.accounts.filter(account =>
          (account.acc_firstName?.toLowerCase() || account.acc_lastName?.toLowerCase() ||'').includes(lowerQuery) ||
          (account.acc_email?.toLowerCase() || '').includes(lowerQuery) ||
          (account.acc_role?.toLowerCase() || '').includes(lowerQuery)
        );
        
        console.log('Filtered campaigns:', filtered); // Debugging
        return filtered;
      }

    // Delete an account with confirmation alert
    deleteAccount(id: string) {
        // SweetAlert confirmation dialog
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this account? This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // If confirmed, proceed with the account deletion
                this.accountService.delete(id)
                    .pipe(first())
                    .subscribe(() => {
                        // Update the account list by filtering out the deleted account
                        this.accounts = this.accounts.filter(x => x.id !== id);
                        
                        // Show success message
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'The account has been deleted successfully.',
                            confirmButtonText: 'OK'
                        });
                    }, error => {
                        // Show error message if something goes wrong
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'There was an issue deleting the account. Please try again later.',
                            confirmButtonText: 'OK'
                        });
                    });
            }
        });
    }

    // Function to export table as PDF
    exportToPDF() {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();

        // Title
        doc.setFontSize(18);
        doc.text('RENTHINGS - Account List', 15, 15);
        doc.setFontSize(12);
        doc.text(`Exported on: ${currentDate}`, 15, 25);

        // Table Headers
        const headers = [['Name', 'Email', 'Role', 'Status', 'Subscription']];
        
        // Table Data
        const data = this.filteredAccounts.map(account => [
            `${account.acc_firstName} ${account.acc_lastName}`,
            account.acc_email,
            account.acc_role,
            account.acc_status,
            account.acc_subscription
        ]);

        // Generate Table
        autoTable(doc, {
            startY: 30,
            head: headers,
            body: data
        });

        // Save PDF
        doc.save(`Account_List.pdf`);
    }
}