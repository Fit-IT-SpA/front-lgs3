import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { OrdersAddComponent } from './orders-add/orders-add.component';
import { ProductsAddComponent } from './products/products-add/products-add.component';
import { ProductsComponent } from './products/products.component';
import { OffersComponent } from './offers/offers.component';

//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
//import { OrdersViewComponent } from './orders-view/orders-view.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'orders',
                component: OrdersComponent
            },
            {
                path: 'orders/add',
                component: OrdersAddComponent
            },
            {
                path: 'orders/:id/products',
                component: ProductsComponent
            },
            {
                path: 'orders/:id/products/add',
                component: ProductsAddComponent
            },
            {
                path: 'orders/offers',
                component: OffersComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrdersRoutingModule { }
