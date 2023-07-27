import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart.component';
import { PurchasesComponent } from './purchases/purchases.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'cart',
                component: CartComponent
            },
            {
                path: 'purchases',
                component: PurchasesComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CartRoutingModule { }
