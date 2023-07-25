import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { OrdersComponent } from './orders.component';
import { OrdersAddComponent } from './orders-add/orders-add.component';
import { OrdersEditComponent } from './orders-edit/orders-edit.component';
import { OrdersViewComponent } from './orders-view/orders-view.component';
import { ProductsAddComponent } from './products/products-add/products-add.component';
import { ProductsViewComponent } from './products/products-view/products-view.component';
import { ProductsComponent } from './products/products.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { OrdersRoutingModule } from './orders.routing';
import { ArchwizardModule } from 'angular-archwizard';
import {OffersComponent  } from './offers/offers.component';
import {OffersAddComponent  } from './offers/offers-add/offers-add.component';
import {OffersViewComponent  } from './offers/offers-view/offers-view.component';
import {OffersDetailComponent  } from './offers/offers-detail/offers-detail.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SalesComponent} from './sales/sales.component';


@NgModule({
    declarations: [
        OrdersComponent,
        OrdersAddComponent,
        OrdersEditComponent,
        OrdersViewComponent,
        ProductsAddComponent,
        ProductsViewComponent,
        ProductsComponent,
        OffersComponent,
        OffersAddComponent,
        OffersViewComponent,
        OffersDetailComponent,
        SalesComponent
    ],
    imports: [
        CommonModule,
        ChartistModule,
        ArchwizardModule,
        NgApexchartsModule,
        SharedModule,
        NgxDatatableModule,
        NgbModule,
        AgmCoreModule.forRoot({
            apiKey: ''
        }),
        LoadingBarModule,
        OrdersRoutingModule,
        NgSelectModule,
        MatSnackBarModule
    ],
    providers: [
    ],
})
export class OrdersModule { }