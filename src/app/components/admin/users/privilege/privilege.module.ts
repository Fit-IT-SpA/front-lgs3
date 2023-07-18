import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { PrivilegeComponent } from './privilege.component';
import { PrivilegeAddComponent } from './privilege-add/privilege-add.component';
import { PrivilegeEditComponent } from './privilege-edit/privilege-edit.component';
import { PrivilegeViewComponent } from './privilege-view/privilege-view.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PrivilegeRoutingModule } from './privilege.routing';

@NgModule({
    declarations: [
        PrivilegeComponent,
        PrivilegeAddComponent,
        PrivilegeEditComponent,
        PrivilegeViewComponent
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
        LoadingBarModule,
        PrivilegeRoutingModule,
        NgSelectModule,
        MatSnackBarModule
    ],
    providers: [
    ],
})
export class PrivilegeModule { }
