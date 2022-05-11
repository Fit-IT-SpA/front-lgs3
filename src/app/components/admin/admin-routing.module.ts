import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferersComponent } from './referers/referers.component';
import {AddComponent} from './referers/add/add.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'referers',
                component: ReferersComponent
            },
            {
                path: 'referers/add',
                component: AddComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
