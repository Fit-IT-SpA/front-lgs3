import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConstantService } from '../services/constant.service';
import { AbstractHttpService } from '../services/abstract-http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EndpointService } from "../services/endpoint.service";
import { AuthServiceNielsen } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard extends AbstractHttpService implements CanActivate {
  head = new HttpHeaders({ 'Content-Type': ConstantService.ContentTypeJson });
  private subscription: Subscription = new Subscription();

  constructor(
    public authService: AuthServiceNielsen,
    public router: Router,
    private _httpClient: HttpClient,
    private _authService: AuthServiceNielsen) { 
      super(_httpClient);
    }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this._httpClient.get<any>(this.apiUrl + EndpointService.Auth_IsLoggedIn, { headers: this.head }).pipe(
      map(response => {
          let profile = JSON.parse(localStorage.getItem('profile'));
          return response;
      }),
      catchError(err => {
          localStorage.removeItem("token")
          if (err.error && err.error.error && err.error.error.message.indexOf("jwt expired") > -1){
              this.router.navigate(['auth/expired']);
              let profile = JSON.parse(localStorage.getItem('profile'));
              this.subscription.add(this._authService.logout(profile.email, 'jwt expired').subscribe(
                (response) => {
                }
              ));
          } else {
              this.router.navigate(['auth/login']);
          }
          return of(false);
      })      
  );
  }
  
}
