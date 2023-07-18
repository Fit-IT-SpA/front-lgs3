import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/firebase/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

    public perfil =  JSON.parse(localStorage.getItem("profile"));
    public openMyAccount: boolean = false;

  constructor(public authService: AuthService, private _router: Router,) { }

  ngOnInit() {
     // console.log(this.perfil);
  }

  toggleMyAccount() {
    this.openMyAccount = !this.openMyAccount;
  }

  logout(){
        localStorage.removeItem("profile")
        this._router.navigate(['/auth/login']);
  }
  
  myProfile() {
    this._router.navigate(['/admin/my-profile']);
  }
}
