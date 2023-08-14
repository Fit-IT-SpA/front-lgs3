import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { SalesManagementComponent } from './sales-management.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SalesManagementRoutingModule } from './sales-management.routing';
import { SalesManagementViewComponent } from './sales-management-view/sales-management-view.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
    declarations: [
        SalesManagementComponent,
        SalesManagementViewComponent
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
        SalesManagementRoutingModule,
        NgSelectModule,
        MatSnackBarModule
    ],
})
export class SalesManagementModule { }
