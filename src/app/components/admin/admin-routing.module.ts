import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferersComponent } from './referers/referers.component';
import {AgregarReferidoComponent} from './agregar-referido/agregar-referido.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'referers',
                component: ReferersComponent
            },
            {
                path: 'agregar-referido',
                component: AgregarReferidoComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
