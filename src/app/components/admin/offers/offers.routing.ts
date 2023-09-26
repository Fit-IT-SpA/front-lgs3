import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffersComponent } from './offers.component';
import { OffersViewComponent } from './offers-view/offers-view.component';
import { OffersEditComponent } from './offers-edit/offers-edit.component';
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
            {
                path: 'offers/view/:id',
                canActivate: [AdminGuard],
                component: OffersViewComponent
            },
            {
                path: 'offers/edit/:id',
                canActivate: [AdminGuard],
                component: OffersEditComponent
            },
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OffersRoutingModule { }
