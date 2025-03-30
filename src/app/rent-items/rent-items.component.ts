import { Component, OnInit } from '@angular/core';
import { ItemService } from '../_services/item.service';
import { Item } from '../_models/item';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './rent-items.component.html'
})
export class RentItemsComponent implements OnInit {
  approvedItems: Item[] = [];
  filteredItems: Item[] = [];
  searchQuery: string = '';
  searchSubject: Subject<string> = new Subject<string>();
  

  constructor(private itemService: ItemService) {}

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
        console.log("Approved Items:", items);  // Debugging: Check if data is received
        this.approvedItems = items;
        this.filteredItems = items;  // Initialize filtered list with all items
      },
      (error) => console.error("Failed to fetch approved items", error)
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

    // Filter by name only
    this.filteredItems = this.approvedItems.filter(item =>
        item.Item_name.toLowerCase().includes(query.toLowerCase())
    );
}

  
}