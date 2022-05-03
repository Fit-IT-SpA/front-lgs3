import { Component,  OnInit } from '@angular/core';

@Component({
    selector: 'app-default',
    templateUrl: './mis-referidos.component.html',
    styleUrls: ['./mis-referidos.component.scss'],
})
export class MisReferidosComponent implements OnInit {
    public perfil =  JSON.parse(localStorage.getItem("profile"));
    constructor() {
console.log('alo')
    }

    ngOnInit() {
    console.log('hola')

    }


}
