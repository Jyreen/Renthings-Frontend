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
    this.itemService.getApprovedItems().subscribe(
      (items) => {
        this.approvedItems = items;
        this.filteredItems = items;
    
        // For each item, fetch the account info
        items.forEach(item => {
          this.accountService.getById(item.acc_id.toString()).subscribe(account => {
            item.acc_address = account.acc_address; // attach it
          });
        });
      }
    );
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);   // Emit query with debounce
  }


  performSearch(query: string): void {
    console.log('Searching for:', query);

    if (!query) {
        this.filteredItems = this.approvedItems;  // Reset to all items when the query is empty
        return;
    }

    console.log('First item:', this.approvedItems[0]);

    // Filter by name or address
    this.filteredItems = this.approvedItems.filter(item =>
        item.Item_name.toLowerCase().includes(query.toLowerCase()) ||
        item.acc_address?.toLowerCase().includes(query.toLowerCase())
    );
}

  
}