import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart.component';

//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
//import { OrdersViewComponent } from './orders-view/orders-view.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'cart',
                component: CartComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CartRoutingModule { }
