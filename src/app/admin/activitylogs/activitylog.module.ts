import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivityLogRoutingModule } from './activitylog-routing.module';
import { ActivityLogComponent } from './activitylog.component';

@NgModule({
  declarations: [ActivityLogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ActivityLogRoutingModule
  ]
})
export class ActivityLogModule {}
