import {Component, OnInit} from '@angular/core';
import {ReferersService} from '../../../shared/services/referers.service';
import {ServiceTypeService} from '../../../shared/services/service-type.service';
import {UserService} from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/firebase/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CompaniesService } from 'src/app/components/admin/companies/companies.service';
import { User } from 'src/app/shared/model/user';


@Component({
    selector: 'app-default',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.scss'],
    providers: [ReferersService, ServiceTypeService, UserService],
})

export class MyProfileComponent implements OnInit{
    private subscription: Subscription = new Subscription();
    public user: User;
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public loading: boolean = true;
    constructor(
        public authService: AuthService, 
        private _router: Router, 
        private userSrv: UserService, 
        private companiesSrv: CompaniesService) { }

    ngOnInit() {
        this.getUser();
    }
    public getUser() {
        this.subscription.add(this.userSrv.findByEmail(this.profile.email).subscribe(
            (response) => {
                this.user = response[0];
                this.loading = false;
            }, (error) => {
                this.loading = false;
                console.log(error);
            }
        ));
    }
}
