import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './_helpers';
import { FeatureGuard } from './_helpers/feature.guard';
import { Role } from './_models';

import { LandingPageComponent } from './landing-page/landing-page.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { HomeComponent } from './home/home.component';
import { RentItemsComponent } from './rent-items/rent-items.component';
import { ItemDetailsComponent } from './rent-items/item-details.component';
import { ListItemComponent } from './list-item/list-item.component';
import { MessageComponent } from './messaging/message.component';
import { ViewRentersComponent } from './list-item/view-renters.component';
import { WorkingComponent } from './progress-page/working.component';
import { ItemHistoryComponent } from './item-history/item-history.component';

const accountModule = () => import('./accounts/account.module').then(x => x.AccountModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);
const adminModule = () => import('./admin/admin.module').then(x => x.AdminModule);

const routes: Routes = [
    { path: 'account', loadChildren: accountModule, canLoad: [FeatureGuard] },
    { path: '', component: LandingPageComponent }, 
    { path: 'about', component: AboutUsComponent, canActivate: [FeatureGuard] },
    { path: 'home', component: HomeComponent, canActivate: [FeatureGuard] },
    { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard, FeatureGuard], canLoad: [FeatureGuard] },
    { path: 'rent', component: RentItemsComponent, canActivate: [FeatureGuard] },
    { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard, FeatureGuard], canLoad: [FeatureGuard], data: { roles: [Role.Admin] }},
    { path: 'view-renters/:itemId', component: ViewRentersComponent, canActivate: [FeatureGuard] },
    { path: 'item/:id', component: ItemDetailsComponent, canActivate: [FeatureGuard] },
    { path: 'list', component: ListItemComponent, canActivate: [FeatureGuard] },
    { path: 'message', component: MessageComponent, canActivate: [FeatureGuard] },
    { path: 'item-history', component: ItemHistoryComponent},
    { path: 'progress', component: WorkingComponent },
    { path: '**', redirectTo: '' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
