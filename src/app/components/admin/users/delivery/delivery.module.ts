import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DeliveryComponent } from './delivery.component';
import { DeliveryViewComponent } from './delivery-view/delivery-view.component';
import { DeliveryRoutingModule } from './delivery.routing';

@NgModule({
    declarations: [
        DeliveryComponent,
        DeliveryViewComponent
    ],
    imports: [
        CommonModule,
        ChartistModule,
        NgApexchartsModule,
        SharedModule,
        NgbModule,
        AgmCoreModule.forRoot({
            apiKey: ''
        }),
        NgxDatatableModule,
        LoadingBarModule,
        DeliveryRoutingModule,
        NgSelectModule,
        MatSnackBarModule
    ],
})
export class DeliveryModule { }
