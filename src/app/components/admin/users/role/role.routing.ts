import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleComponent } from './role.component';
import { RoleAddComponent } from './role-add/role-add.component';
import { RoleEditComponent } from './role-edit/role-edit.component';
import { RoleViewComponent } from './role-view/role-view.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/role',
                canActivate: [AdminGuard],
                component: RoleComponent
            },
            {
                path: 'users/role/add',
                canActivate: [AdminGuard],
                component: RoleAddComponent
            },
            {
                path: 'users/role/edit/:slug',
                canActivate: [AdminGuard],
                component: RoleEditComponent
            },
            {
                path: 'users/role/view/:slug',
                canActivate: [AdminGuard],
                component: RoleViewComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RoleRoutingModule { }
