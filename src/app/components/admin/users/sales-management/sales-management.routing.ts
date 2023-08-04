import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesManagementComponent } from './sales-management.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/sales-management',
                canActivate: [AdminGuard],
                component: SalesManagementComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SalesManagementRoutingModule { }
