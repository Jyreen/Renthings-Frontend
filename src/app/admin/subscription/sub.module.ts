import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SubRoutingModule } from './sub-routing.module';
import { SubListComponent } from './sub-list.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SubRoutingModule,
        FormsModule
    ],
    declarations: [
        SubListComponent
    ], 
})
export class SubModule { }