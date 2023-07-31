import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesManagementComponent } from './sales-management.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/sales-management',
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
