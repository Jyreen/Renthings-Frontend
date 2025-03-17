import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
///import { AccountsReportComponent } from './accounts-report/accounts-report.component';
import { FeatureGuard } from '../_helpers/feature.guard';

// Lazy load 
const accountsModule = () => import('./accounts/accounts.module').then(x => x.AccountsModule);
const itemsModule = () => import('./items/items.module').then(x => x.ItemsModule);
const subscriptionsModule = () => import('./subscription/sub.module').then(x => x.SubModule);
const revenueModule = () => import('./revenue/revenue.module').then(x => x.RevenueModule);
const reportModule = () => import('./accounts-report/acc-report.module').then(x => x.ReportModule);

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: OverviewComponent, canActivate: [FeatureGuard] },
            { path: 'accounts', loadChildren: accountsModule, canActivate: [FeatureGuard] },
            { path: 'items', loadChildren: itemsModule, canActivate: [FeatureGuard] },
            { path: 'subscription', loadChildren: subscriptionsModule, canActivate: [FeatureGuard] },
            { path: 'revenue', loadChildren: revenueModule, canActivate: [FeatureGuard] },
            { path: 'report', loadChildren: reportModule, canActivate: [FeatureGuard]},

        ],

        
    },

    // admin reports
    // {path: 'admin/accounts-report', component: AccountsReportComponent, canActivate: [FeatureGuard]},
    //{path: 'admin/items-report', component: AccountsReportComponent, canActivate: [FeatureGuard]},
    //{path: 'admin/subscriptions-report', component: AccountsReportComponent, canActivate: [FeatureGuard]}

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }