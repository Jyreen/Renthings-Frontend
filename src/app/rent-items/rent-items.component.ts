import { Component, OnInit } from '@angular/core';
import { ItemService } from '../_services/item.service';
import { Item } from '../_models/item';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AccountService } from '../_services';

@Component({
  selector: 'app-home',
  templateUrl: './rent-items.component.html'
})
export class RentItemsComponent implements OnInit {
  approvedItems: Item[] = [];
  filteredItems: Item[] = [];
  searchQuery: string = '';
  searchSubject: Subject<string> = new Subject<string>();
  

  constructor(private itemService: ItemService, private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadApprovedItems();

    this.searchSubject.pipe(
      debounceTime(300)   // 300ms debounce to prevent excessive filtering
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  loadApprovedItems(): void {
    this.itemService.getApprovedItems().subscribe({
      next: (items) => {
        console.log('Approved items:', items);
        this.approvedItems = items;
        this.filteredItems = items;
        const missingAddresses = items.filter(item => !item.account?.acc_address);
        if (missingAddresses.length > 0) {
          console.warn('Items with missing acc_address:', missingAddresses);
        }
      },
      error: (error) => {
        console.error('Error loading approved items:', error);
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query); // Emit query with debounce
  }

  performSearch(query: string): void {
    console.log('Searching for:', query);
    if (!query.trim()) {
      this.filteredItems = this.approvedItems;
      return;
    }
    const queryLower = query.toLowerCase().trim();
    this.filteredItems = this.approvedItems.filter(item => {
      const nameMatch = item.Item_name?.toLowerCase().includes(queryLower) || false;
      const addressMatch = item.account?.acc_address
        ? item.account.acc_address.toLowerCase().includes(queryLower)
        : false;
      console.log(`Item: ${item.Item_name}, acc_address: ${item.account?.acc_address}, Name match: ${nameMatch}, Address match: ${addressMatch}`);
      return nameMatch || addressMatch;
    });
  }
}