import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferersComponent } from './referers/referers.component';
import {AddComponent} from './referers/add/add.component';
import {SellerComponent} from './referers/seller/seller.component';
import {MyProfileComponent} from './my-profile/my-profile.component';
import {ReferersSellersSellsComponent} from './referers/seller/sells/sells.component';
import {DesconectarComponent} from './desconectar/desconectar.component';
import { AdminGuard } from '../../shared/guard/admin.guard';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'my-profile',
                component: MyProfileComponent
            },
            {
                path: 'referers',
                component: ReferersComponent
            },
            {
                path: 'referers/add',
                component: AddComponent
            },
            {
                path: 'referers/seller',
                component: SellerComponent
            },
            {
                path: 'desconectar',
                component: DesconectarComponent
            },
            {
                path: 'referers/seller/sells',
                component: ReferersSellersSellsComponent
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./users/user/user.module').then(m => m.UserModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./users/role/role.module').then(m => m.RoleModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./users/privilege/privilege.module').then(m => m.PrivilegeModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./users/sales-management/sales-management.module').then(m => m.SalesManagementModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./companies/companies.module').then(m => m.CompaniesModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./cart/cart.module').then(m => m.CartModule)
            },

        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }