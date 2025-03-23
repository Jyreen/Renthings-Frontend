import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor, ErrorInterceptor, appInitializer } from './_helpers';
import { AccountService } from './_services';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { HomeComponent } from './home/home.component';
import { RentItemsComponent } from './rent-items/rent-items.component';
import { ItemDetailsComponent } from './rent-items/item-details.component';
import { ListItemComponent } from './list-item/list-item.component';
import { MessageComponent } from './messaging/message.component';
import { FilterUsersPipe } from './messaging/filter-users.pipe';
import { DateRangePickerComponent } from './rent-items/date-range-picker.component';
import { ViewRentersComponent } from './list-item/view-renters.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { WorkingComponent } from './progress-page/working.component';
import { ItemHistoryComponent } from './item-history/item-history.component';
@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        CommonModule,
        MatDatepickerModule,
        MatInputModule,
        MatFormFieldModule,
        MatNativeDateModule,
        BrowserAnimationsModule
    ],
    declarations: [
        AppComponent,
        LandingPageComponent,
        AboutUsComponent,
        HomeComponent,
        RentItemsComponent,
        ItemDetailsComponent, 
        ListItemComponent,
        MessageComponent,
        FilterUsersPipe,
        DateRangePickerComponent, 
        ViewRentersComponent,
        WorkingComponent,
        ItemHistoryComponent,
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }