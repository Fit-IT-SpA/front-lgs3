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

import { ReferersComponent } from './referers/referers.component';
import { AddComponent } from './referers/add/add.component';
import { SellerComponent } from './referers/seller/seller.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import {ReferersSellersSellsComponent} from './referers/seller/sells/sells.component';
import {DesconectarComponent} from './desconectar/desconectar.component';
import {CompaniesComponent} from './companies/companies.component';
import {CompaniesAddComponent} from './companies/companies-add/companies-add.component';
import {CompaniesEditComponent} from './companies/companies-edit/companies-edit.component';
import {CompaniesViewComponent} from './companies/companies-view/companies-view.component';
import {OrdersComponent} from './orders/orders.component';
import {OffersComponent} from './offers/offers.component';
import {OrdersAddComponent} from './orders/orders-add/orders-add.component';
import {OrdersEditComponent} from './orders/orders-edit/orders-edit.component';
import { OrdersViewComponent } from './orders/orders-view/orders-view.component';
import { OffersViewComponent } from './offers/offers-view/offers-view.component';
import {OffersAddComponent} from './offers/offers-add/offers-add.component';
import {OffersDetailComponent} from './offers/offers-detail/offers-detail.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsRoutingModule } from '../forms/forms-routing.module';
import { ArchwizardModule } from 'angular-archwizard';


@NgModule({
    declarations: [
        ReferersComponent,
        AddComponent,
        SellerComponent,
        MyProfileComponent,
        ReferersSellersSellsComponent,
        DesconectarComponent,
        CompaniesComponent,
        CompaniesAddComponent,
        CompaniesEditComponent,
        CompaniesViewComponent,
        OrdersComponent,
        OrdersAddComponent,
        OrdersViewComponent,
        OrdersEditComponent,
        OffersDetailComponent,
        OffersAddComponent,
        OffersViewComponent,
        OffersComponent
    ],
    imports: [
        CommonModule,
        ChartistModule,
        ChartsModule,
        NgApexchartsModule,
        SharedModule,
        CarouselModule,
        CKEditorModule,
        NgxDatatableModule,
        CountToModule,
        NgbModule,
        FormsModule,
        FormsRoutingModule,
        ReactiveFormsModule,
        ArchwizardModule,
        AgmCoreModule.forRoot({
            apiKey: ''
        }),
        AdminRoutingModule
    ]
})
export class AdminModule { }
