import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from './abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from './constant.service';
import { User } from '../model/user';


@Injectable()
export class CompaniesService extends AbstractHttpService {

    constructor(protected http: HttpClient) {
        super(http);
    }
    add(user: User) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/companies`, user, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    countByEmail(email: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/companies/count/'+email, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
    findByEmail(email: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/companies/'+email, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
    updateByRut(user: User, rut: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/companies/update/`+rut, user, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    remove(email: string, rut: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(
                this.apiUrl + '/companies/'+email+'/'+rut, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    private completeZero(value){
        if (Number.parseInt(value) < 10){
            return "0" + value;
        }
        return value;
    }

}
