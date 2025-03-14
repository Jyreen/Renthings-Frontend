import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-items-report',
    templateUrl: './items-report.component.html'
})
export class ItemsReportComponent implements OnInit {

    items: any[] = [];

    constructor() { }

    ngOnInit(): void {
        this.loadItems();
    }

    loadItems(): void {
        // Replace this with actual data fetching logic
        this.items = [
            { id: 1, name: 'Item 1', description: 'Description 1' },
            { id: 2, name: 'Item 2', description: 'Description 2' },
            { id: 3, name: 'Item 3', description: 'Description 3' }
        ];
    }

}