import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { RevenueRoutingModule } from './revenue-routing.module';
import { RevenueComponent } from './revenue-list';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RevenueRoutingModule,
        FormsModule
    ],
    declarations: [
        RevenueComponent
    ], 
})
export class RevenueModule { }