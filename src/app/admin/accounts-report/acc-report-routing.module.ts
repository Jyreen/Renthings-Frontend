import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountsReportComponent } from './accounts-report.component';

const routes: Routes = [
    { path: '', component: AccountsReportComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportRoutingModule { }