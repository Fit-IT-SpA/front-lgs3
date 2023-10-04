import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryComponent } from './delivery.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/delivery',
                canActivate: [AdminGuard],
                component: DeliveryComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DeliveryRoutingModule { }
