import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { SubModule } from './subscription/sub.module';

// Lazy load 
const accountsModule = () => import('./accounts/accounts.module').then(x => x.AccountsModule);
const itemsModule = () => import('./items/items.module').then(x => x.ItemsModule);
const subscriptionsModule = () => import('./subscription/sub.module').then(x => x.SubModule)
const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: OverviewComponent },
            { path: 'accounts', loadChildren: accountsModule },
            { path: 'items', loadChildren: itemsModule },
            { path: 'subscription', loadChildren: subscriptionsModule}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }