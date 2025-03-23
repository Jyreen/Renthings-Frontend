import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { ItemService } from '../../_services/item.service';
import Swal from 'sweetalert2'; // Import SweetAlert
import { Item } from '../../_models';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({ templateUrl: 'items-list.component.html' })
export class ItemsListComponent implements OnInit {
    items: Item[] = [];
    searchQuery: string = '';
    loadingItemId: number | null = null;
    
    constructor(private itemService: ItemService) {}

    ngOnInit() {
        this.loadItems();
    }

    loadItems() {
        this.itemService.getAll()
            .pipe(first())
            .subscribe(items => this.items = items);
    }

    get filteredItems(): Item[] {
        if (!this.searchQuery.trim()) return this.items;

        const lowerQuery = this.searchQuery.toLowerCase();
        return this.items.filter(item =>
            item.Item_name.toLowerCase().includes(lowerQuery) ||
            (item.Item_Description?.toLowerCase() || '').includes(lowerQuery) ||
            item.Item_approvalstatus.toLowerCase().includes(lowerQuery)
        );
    }

    approveItem(itemId: number) {
        this.loadingItemId = itemId;
        this.itemService.approve(itemId)
            .pipe(first())
            .subscribe(() => {
                Swal.fire('Approved!', 'The item has been approved.', 'success');
                this.loadingItemId = null;
                this.loadItems(); // Reload the item list
            }, error => {
                Swal.fire('Error', 'There was an issue approving the item.', 'error');
                this.loadingItemId = null;
            });
    }

    // Reject an item
    rejectItem(itemId: number) {
        Swal.fire({
            title: 'Reject Item',
            input: 'text',
            inputPlaceholder: 'Enter rejection reason',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                this.loadingItemId = itemId;
                const rejectionReason = result.value;
                this.itemService.reject(itemId, rejectionReason)
                    .pipe(first())
                    .subscribe(() => {
                        Swal.fire('Rejected!', 'The item has been rejected.', 'success');
                        this.loadingItemId = null;
                        this.loadItems(); // Reload the item list
                    }, error => {
                        Swal.fire('Error', 'There was an issue rejecting the item.', 'error');
                        this.loadingItemId = null;
                    });
            }
        });
    }

    private updateItemStatus(item: Item, successMessage: string) {
        this.itemService.update(item.Item_id, item)
            .pipe(first())
            .subscribe(
                () => {
                    Swal.fire('Success!', successMessage, 'success');
                },
                () => {
                    Swal.fire('Error', 'Failed to update item status. Please try again later.', 'error');
                }
            );
    }

    // Function to export table as PDF
    exportToPDF() {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();

        // Title
        doc.setFontSize(18);
        doc.text('RENTHINGS - Items List', 15, 15);
        doc.setFontSize(12);
        doc.text(`Exported on: ${currentDate}`, 15, 25);

        // Table Headers
        const headers = [['Name', 'Price', 'Status', 'Approval Status']];
        
        // Table Data
        const data = this.filteredItems.map(item => [
            item.Item_name,
            `$${item.Item_price.toFixed(2)}`,
            item.Item_status,
            item.Item_approvalstatus
        ]);
        

        // Generate Table
        autoTable(doc, {
            startY: 30,
            head: headers,
            body: data
        });

        // Save PDF
        doc.save(`Items_List.pdf`);
    }
}
