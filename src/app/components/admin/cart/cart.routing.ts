import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart.component';
import { CartConfirmPaymentComponent } from './cart-confirm-payment/cart-confirm-payment.component';
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
                path: 'cart/confirm-payment/:id',
                canActivate: [AdminGuard],
                component: CartConfirmPaymentComponent
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
