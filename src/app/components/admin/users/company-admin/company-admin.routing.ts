import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyAdminComponent } from './company-admin.component';
import { CompanyAdminViewComponent } from './company-admin-view/company-admin-view.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';

//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
//import { OrdersViewComponent } from './orders-view/orders-view.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/company',
                canActivate: [AdminGuard],
                component: CompanyAdminComponent
            },
            {
                path: 'users/company/view/:id',
                canActivate: [AdminGuard],
                component: CompanyAdminViewComponent
            },
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CompanyAdminRoutingModule { }
