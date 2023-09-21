import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { OffersRoutingModule } from './offers.routing';
import { ArchwizardModule } from 'angular-archwizard';
import {OffersComponent  } from './offers.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';


@NgModule({
    declarations: [
        OffersComponent
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
        OffersRoutingModule,
        NgSelectModule,
        MatSnackBarModule
    ],
    providers: [
    ],
})
export class OffersModule { }