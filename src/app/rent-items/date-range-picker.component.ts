import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { Subscription } from '../_models';
declare var $: any;

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html'
})
export class DateRangePickerComponent implements AfterViewInit {

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.initializeDateRangePicker();
  }

  initializeDateRangePicker(): void {
    const input = $(this.el.nativeElement).find('input[name="daterange"]');
    input.daterangepicker(
      {
        startDate: '01/01/2025',
        endDate: '17/01/2025',
        opens: 'center',
        locale: {
          format: 'DD/MM/YYYY'
        }
      },
      (start: any, end: any) => {
        console.log(`Date range selected: ${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`);
      }
    );
  }
}
