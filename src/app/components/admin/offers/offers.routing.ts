import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffersComponent } from './offers.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';

//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
//import { OrdersViewComponent } from './orders-view/orders-view.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'offers',
                canActivate: [AdminGuard],
                component: OffersComponent
            },
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OffersRoutingModule { }
