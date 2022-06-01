import {Component, OnInit} from '@angular/core';
import {ReferersService} from '../../../shared/services/referers.service';
import {ServiceTypeService} from '../../../shared/services/service-type.service';
import {UserService} from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/firebase/auth.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-default',
    templateUrl: './desconectar.component.html',
    styleUrls: ['./desconectar.component.scss'],
    providers: [ReferersService, ServiceTypeService, UserService],
})

export class DesconectarComponent implements OnInit{
    user: any;
    public perfil =  JSON.parse(localStorage.getItem('profile'));
    constructor(public authService: AuthService, private _router: Router, private userSrv: UserService) { }
    ngOnInit() {
        this.logout();
    }
    logout(){
        localStorage.removeItem('profile');
        this._router.navigate(['/auth/login']);
    }
}
