import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsReportComponent } from './products/products-report.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';

//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
//import { OrdersViewComponent } from './orders-view/orders-view.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'report/products',
                canActivate: [AdminGuard],
                component: ProductsReportComponent
            },
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportRoutingModule { }
