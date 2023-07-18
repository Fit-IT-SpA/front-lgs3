import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { UserAddComponent } from './user-add/user-add.component';
import { UserEditComponent } from './user-edit/user-edit.component';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/user',
                component: UserComponent
            },
            {
                path: 'users/user/add',
                component: UserAddComponent
            },
            {
                path: 'users/user/edit/:id',
                component: UserEditComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule { }
