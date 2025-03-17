import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './acc-report-routing.module';
import { AccountsReportComponent } from './accounts-report.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ReportRoutingModule,
        FormsModule
    ],
    declarations: [
        AccountsReportComponent
    ], 
})
export class ReportModule { }