import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubListComponent } from './sub-list.component';

const routes: Routes = [
    { path: '', component: SubListComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SubRoutingModule { }