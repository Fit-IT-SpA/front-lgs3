import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryComponent } from './delivery.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';
import { DeliveryViewComponent } from './delivery-view/delivery-view.component';


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
    },
    {
        path: '',
        children: [
            {
                path: 'users/delivery/view/:id',
                canActivate: [AdminGuard],
                component: DeliveryViewComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DeliveryRoutingModule { }
