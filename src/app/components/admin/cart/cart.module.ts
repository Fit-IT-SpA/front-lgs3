import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { CartComponent } from './cart.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ArchwizardModule } from 'angular-archwizard';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CartRoutingModule } from './cart.routing';


@NgModule({
    declarations: [
        CartComponent,
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
        CartRoutingModule,
        LoadingBarModule,
        NgSelectModule,
        MatSnackBarModule
    ],
    providers: [
    ],
})
export class CartModule { }