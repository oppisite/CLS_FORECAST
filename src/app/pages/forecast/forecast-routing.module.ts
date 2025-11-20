import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardForecastComponent } from './dashboard/dashboard.component';
import { OverviewForecastComponent } from './overviewForecast/overviewForecast.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SalesDashboardComponent } from './salesDashboard/salesDashboard.component';

const routes: Routes = [
    { path: '', component: OverviewForecastComponent },
    { path: 'dashboard', component: DashboardForecastComponent },
    { path: 'overview', component: OverviewForecastComponent },
    { path: 'inventory', component: InventoryComponent },
    { path: 'salesDashboard', component: SalesDashboardComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ForecastRoutingModule {}