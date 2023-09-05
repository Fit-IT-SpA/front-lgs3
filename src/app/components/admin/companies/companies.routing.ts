import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompaniesComponent } from './companies.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';
import { CompaniesAddComponent } from './companies-add/companies-add.component';
import { CompaniesEditComponent } from './companies-edit/companies-edit.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'companies',
                canActivate: [AdminGuard],
                component: CompaniesComponent
            }, 
            {
                path: 'companies/add',
                canActivate: [AdminGuard],
                component: CompaniesAddComponent
            },
            {
                path: 'companies/edit/:id',
                canActivate: [AdminGuard],
                component: CompaniesEditComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CompaniesRoutingModule { }
