import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivilegeComponent } from './privilege.component';
import { PrivilegeAddComponent } from './privilege-add/privilege-add.component';
import { PrivilegeEditComponent } from './privilege-edit/privilege-edit.component';
import { PrivilegeViewComponent } from './privilege-view/privilege-view.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/privilege',
                component: PrivilegeComponent
            },
            {
                path: 'users/privilege/add',
                component: PrivilegeAddComponent
            },
            {
                path: 'users/privilege/edit/:slug',
                component: PrivilegeEditComponent
            },
            {
                path: 'users/privilege/view/:slug',
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
