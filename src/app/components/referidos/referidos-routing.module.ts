import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MisReferidosComponent } from './mis-referidos/mis-referidos.component';
import {AgregarReferidoComponent} from './agregar-referido/agregar-referido.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'mis-referidos',
                component: MisReferidosComponent
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
export class ReferidosRoutingModule { }
