import { Component, OnInit } from '@angular/core';
import { Item } from '../_models/item';
import { ItemService } from '../_services/item.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

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
