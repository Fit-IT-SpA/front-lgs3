import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { OrdersAddComponent } from './orders-add/orders-add.component';
import { ProductsAddComponent } from './products/products-add/products-add.component';
import { ProductsEditComponent } from './products/products-edit/products-edit.component';
import { ProductsViewComponent } from './products/products-view/products-view.component';
import { ProductsComponent } from './products/products.component';
import { OffersComponent } from './offers/offers.component';
import { SalesComponent } from './sales/sales.component';
import { SalesHandlerComponent } from './sales/sales-handler/sales-handler.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';
import { OffersAddComponent } from './offers/offers-add/offers-add.component';
import { OrdersEditComponent } from './orders-edit/orders-edit.component';

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
                path: 'orders/edit/:id',
                canActivate: [AdminGuard],
                component: OrdersEditComponent
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
                path: 'orders/:id/products/edit/:product',
                canActivate: [AdminGuard],
                component: ProductsEditComponent
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
                path: 'orders/offers/add/:product',
                canActivate: [AdminGuard],
                component: OffersAddComponent
            },
            {
                path: 'orders/sales',
                canActivate: [AdminGuard],
                component: SalesComponent
            },
            {
                path: 'orders/sales/:id',
                canActivate: [AdminGuard],
                component: SalesHandlerComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrdersRoutingModule { }
