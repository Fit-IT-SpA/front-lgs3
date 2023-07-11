import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { RoleComponent } from './role.component';
import { RoleAddComponent } from './role-add/role-add.component';
import { RoleEditComponent } from './role-edit/role-edit.component';
import { RoleViewComponent } from './role-view/role-view.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RoleRoutingModule } from './role.routing';


@NgModule({
    declarations: [
        RoleComponent,
        RoleAddComponent,
        RoleEditComponent,
        RoleViewComponent
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
        RoleRoutingModule,
        NgSelectModule,
        MatSnackBarModule,
    ],
    providers: [
    ],
})
export class RoleModule { }
