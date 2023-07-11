import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleComponent } from './role.component';
import { RoleAddComponent } from './role-add/role-add.component';
import { RoleEditComponent } from './role-edit/role-edit.component';
import { RoleViewComponent } from './role-view/role-view.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/role',
                component: RoleComponent
            },
            {
                path: 'users/role/add',
                component: RoleAddComponent
            },
            {
                path: 'users/role/edit/:slug',
                component: RoleEditComponent
            },
            {
                path: 'users/role/view/:slug',
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
