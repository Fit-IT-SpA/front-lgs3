import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { trxLogsComponent } from './trx-logs.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';


export const routes: Routes = [
    {
        path: 'system',
        children: [
            {
                path: 'trx-logs',
                canActivate: [AdminGuard],
                component: trxLogsComponent
            }
        ],
    },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TrxLogsRoutingModule { }
