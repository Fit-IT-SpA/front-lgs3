import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { Observable } from "rxjs";
import { EndpointService } from "./endpoint.service";
import { ConstantService } from './constant.service';
import { AbstractHttpService } from './abstract-http.service';

@Injectable()
export class AccountService extends AbstractHttpService {
  head = new HttpHeaders({ 'Content-Type': ConstantService.ContentTypeJson });
  constructor(public http: HttpClient) { 
    super(http);
  }

  forgotPassword(email : String) : Observable<any> {
        let body = {user: email };
        return this.http.post<any>(this.apiUrl + EndpointService.Recover_Request, body, { headers: this.head })
        .pipe(map( response => { return response }));
   }

    
   setPassword(id: string, password: string) : Observable<any> {
      let body = { email: id, password : password };
      return this.http.post<any>(this.apiUrl + EndpointService.Recover_SetPassword, body, { headers: this.head })
        .pipe(map( response => { 
          return response 
        })
      );
    }

    validateHashForgotPassword(hash : string ) : Observable<any> {
      return this.http.get<any>(this.apiUrl + EndpointService.Acc_CheckStatus + hash)
        .pipe(map( response => { return response })
      );
    }

    updatePassword(email : string, password: string, token: string) : Observable<any> {
      let body = { email: email, password : password, hash: token };
      return this.http.put<any>(this.apiUrl + EndpointService.Recover_UpdatePassword, body, { headers: this.head })
        .pipe(map( response => { 
          return response 
        })
      );
    }

    activate(token: string): Observable<any> {
        return this.http.get<any>(this.apiUrl + EndpointService.Account_Activate + token).pipe(
          map(response => {
            return response;
          })
        );
    }

    checkActivate(email: string): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/recover-passwords/check-activate/${email}`).pipe(
        map(response => {
          return response;
        })
      );
  }
}