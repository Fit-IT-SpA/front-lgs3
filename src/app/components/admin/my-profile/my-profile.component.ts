import {Component, OnInit} from '@angular/core';
import {ReferersService} from '../../../shared/services/referers.service';
import {ServiceTypeService} from '../../../shared/services/service-type.service';
import {UserService} from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/firebase/auth.service';
import { Router } from '@angular/router';
import { Company } from '../../../shared/model/company';


@Component({
    selector: 'app-default',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.scss'],
    providers: [ReferersService, ServiceTypeService, UserService],
})

export class MyProfileComponent implements OnInit{
    user: any;
    public perfil =  JSON.parse(localStorage.getItem('profile'));
    constructor(public authService: AuthService, private _router: Router, private userSrv: UserService) { }

    ngOnInit() {
        //console.log(this.perfil)
        this.userSrv.findByEmail(this.perfil.email).subscribe(
            (response) => {
                this.user = response[0];
                console.log(this.user);
            });
        console.log('alo');
    //    console.log(this.companias.length);


    }
    logout(){
        localStorage.removeItem('profile');
        this._router.navigate(['/auth/login']);
    }
}
