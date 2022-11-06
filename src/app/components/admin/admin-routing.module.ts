import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferersComponent } from './referers/referers.component';
import {AddComponent} from './referers/add/add.component';
import {SellerComponent} from './referers/seller/seller.component';
import {MyProfileComponent} from './my-profile/my-profile.component';
import {ReferersSellersSellsComponent} from './referers/seller/sells/sells.component';
import {DesconectarComponent} from './desconectar/desconectar.component';
import { CompaniesComponent } from './companies/companies.component';
import { CompaniesAddComponent } from './companies/companies-add/companies-add.component';


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
                path: 'companies',
                component: CompaniesComponent
            }

        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
