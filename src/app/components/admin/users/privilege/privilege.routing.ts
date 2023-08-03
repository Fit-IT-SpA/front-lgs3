import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivilegeComponent } from './privilege.component';
import { PrivilegeAddComponent } from './privilege-add/privilege-add.component';
import { PrivilegeEditComponent } from './privilege-edit/privilege-edit.component';
import { PrivilegeViewComponent } from './privilege-view/privilege-view.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/privilege',
                canActivate: [AdminGuard],
                component: PrivilegeComponent
            },
            {
                path: 'users/privilege/add',
                canActivate: [AdminGuard],
                component: PrivilegeAddComponent
            },
            {
                path: 'users/privilege/edit/:slug',
                canActivate: [AdminGuard],
                component: PrivilegeEditComponent
            },
            {
                path: 'users/privilege/view/:slug',
                canActivate: [AdminGuard],
                component: PrivilegeViewComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PrivilegeRoutingModule { }
