import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { CompaniesComponent } from './companies.component';
import { CompaniesAddComponent } from './companies-add/companies-add.component';
import { CompaniesEditComponent } from './companies-edit/companies-edit.component';
import { CompaniesViewComponent } from './companies-view/companies-view.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CompaniesRoutingModule } from './companies.routing';
import { ArchwizardModule } from 'angular-archwizard';


@NgModule({
    declarations: [
        CompaniesComponent,
        CompaniesAddComponent,
        CompaniesEditComponent,
        CompaniesViewComponent
    ],
    imports: [
        CommonModule,
        ChartistModule,
        ArchwizardModule,
        NgApexchartsModule,
        SharedModule,
        NgbModule,
        AgmCoreModule.forRoot({
            apiKey: ''
        }),
        LoadingBarModule,
        CompaniesRoutingModule,
        NgSelectModule,
        MatSnackBarModule,
    ],
    providers: [
    ],
})
export class CompaniesModule { }
