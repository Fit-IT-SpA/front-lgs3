import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { OrdersAddComponent } from './orders-add/orders-add.component';
import { ProductsAddComponent } from './products/products-add/products-add.component';
import { ProductsViewComponent } from './products/products-view/products-view.component';
import { ProductsComponent } from './products/products.component';
import { OffersComponent } from './offers/offers.component';
import { SalesComponent } from './sales/sales.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';

//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
//import { OrdersViewComponent } from './orders-view/orders-view.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'orders',
                canActivate: [AdminGuard],
                component: OrdersComponent
            },
            {
                path: 'orders/add',
                canActivate: [AdminGuard],
                component: OrdersAddComponent
            },
            {
                path: 'orders/:id/products',
                canActivate: [AdminGuard],
                component: ProductsComponent
            },
            {
                path: 'orders/:id/products/add',
                canActivate: [AdminGuard],
                component: ProductsAddComponent
            },
            {
                path: 'orders/:id/products/view/:product',
                canActivate: [AdminGuard],
                component: ProductsViewComponent
            },
            {
                path: 'orders/offers',
                canActivate: [AdminGuard],
                component: OffersComponent
            },
            {
                path: 'orders/sales',
                canActivate: [AdminGuard],
                component: SalesComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrdersRoutingModule { }
