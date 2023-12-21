import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MyProfileComponent} from './my-profile/my-profile.component';
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
                path: 'desconectar',
                component: DesconectarComponent
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
                loadChildren: () => import('./users/delivery/delivery.module').then(m => m.DeliveryModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./users/company-admin/company-admin.module').then(m => m.CompanyAdminModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./system/trxlogs/trx-logs.module').then(m => m.TrxLogsModule)
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
                loadChildren: () => import('./offers/offers.module').then(m => m.OffersModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./cart/cart.module').then(m => m.CartModule)
            },
            {
                path: '',
                canActivate: [AdminGuard],
                loadChildren: () => import('./report/report.module').then(m => m.ReportModule)
            },

        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }