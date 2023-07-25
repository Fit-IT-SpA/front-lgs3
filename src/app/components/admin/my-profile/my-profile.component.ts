import {Component, OnInit} from '@angular/core';
import {ReferersService} from '../../../shared/services/referers.service';
import {ServiceTypeService} from '../../../shared/services/service-type.service';
import {UserService} from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/firebase/auth.service';
import { Router } from '@angular/router';
import { CompaniesService } from 'src/app/shared/services/companies.service';
import { User } from 'src/app/shared/model/user';


@Component({
    selector: 'app-default',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.scss'],
    providers: [ReferersService, ServiceTypeService, UserService],
})

export class MyProfileComponent implements OnInit{
    user: User;
    public perfil =  JSON.parse(localStorage.getItem('profile'));
    public loading: boolean = true;
    constructor(public authService: AuthService, private _router: Router, private userSrv: UserService, private companiesSrv: CompaniesService) { }

    ngOnInit() {
        console.log(this.perfil);
        this.companiesSrv.findByEmail(this.perfil.email).subscribe(
            (response) => {
                this.user = response;
                this.loading = false;
                //console.log(this.user);
            });
    //    console.log(this.companias.length);


    }
    logout(){
        localStorage.removeItem('profile');
        this._router.navigate(['/auth/login']);
    }
}
