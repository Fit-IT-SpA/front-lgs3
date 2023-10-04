import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CountToModule } from 'angular-count-to';
import { ChartistModule } from 'ng-chartist';
import { ChartsModule } from 'ng2-charts';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { AdminRoutingModule } from './admin-routing.module';

import { MyProfileComponent } from './my-profile/my-profile.component';
import {DesconectarComponent} from './desconectar/desconectar.component';
import { OrdersModule } from './orders/orders.module';
import { OffersModule } from './offers/offers.module';
import { FormsRoutingModule } from '../forms/forms-routing.module';
import { UserModule } from './users/user/user.module';
import { RoleModule } from './users/role/role.module';
import { PrivilegeModule } from './users/privilege/privilege.module';
import { SalesManagementModule } from './users/sales-management/sales-management.module';
import { CompaniesModule } from './companies/companies.module';
import { CartModule } from './cart/cart.module';
import { DeliveryModule } from './users/delivery/delivery.module';


@NgModule({
    declarations: [
        MyProfileComponent,
        DesconectarComponent,
    ],
    imports: [
        CommonModule,
        UserModule,
        RoleModule,
        PrivilegeModule,
        SalesManagementModule,
        DeliveryModule,
        OrdersModule,
        OffersModule,
        CompaniesModule,
        ChartistModule,
        ChartsModule,
        NgApexchartsModule,
        SharedModule,
        CarouselModule,
        CKEditorModule,
        CountToModule,
        NgbModule,
        FormsModule,
        CartModule,
        FormsRoutingModule,
        ReactiveFormsModule,
        AgmCoreModule.forRoot({
            apiKey: ''
        }),
        AdminRoutingModule
    ]
})
export class AdminModule { }