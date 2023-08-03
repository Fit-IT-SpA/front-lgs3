import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'cart',
                canActivate: [AdminGuard],
                component: CartComponent
            },
            {
                path: 'purchases',
                canActivate: [AdminGuard],
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
