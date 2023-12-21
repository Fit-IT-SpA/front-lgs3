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
import { CompanyAdminRoutingModule } from './company-admin.routing';
import { ArchwizardModule } from 'angular-archwizard';
import { CompanyAdminComponent } from './company-admin.component';
import { CompanyAdminViewComponent } from './company-admin-view/company-admin-view.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';


@NgModule({
    declarations: [
        CompanyAdminComponent,
        CompanyAdminViewComponent
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
        CompanyAdminRoutingModule,
        NgSelectModule,
        MatSnackBarModule
    ],
    providers: [
    ],
})
export class CompanyAdminModule { }