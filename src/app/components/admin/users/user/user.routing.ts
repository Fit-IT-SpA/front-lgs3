import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { UserAddComponent } from './user-add/user-add.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { AdminGuard } from 'src/app/shared/guard/admin.guard';


export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'users/user',
                canActivate: [AdminGuard],
                component: UserComponent
            },
            {
                path: 'users/user/add',
                canActivate: [AdminGuard],
                component: UserAddComponent
            },
            {
                path: 'users/user/edit/:id',
                canActivate: [AdminGuard],
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
