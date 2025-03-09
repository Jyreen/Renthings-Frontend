import { Component, OnInit } from '@angular/core';
import { ItemService } from '../_services/item.service';
import { Item } from '../_models/item';

@Component({
  selector: 'app-home',
  templateUrl: './rent-items.component.html'
})
export class RentItemsComponent implements OnInit {
  approvedItems: Item[] = [];

  constructor(private itemService: ItemService) {}

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
  
}