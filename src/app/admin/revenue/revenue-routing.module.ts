import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RevenueComponent } from './revenue-list';

const routes: Routes = [
    { path: '', component: RevenueComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RevenueRoutingModule { }