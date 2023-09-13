import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../shared/services/abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from '../../../shared/services/constant.service';
import { User } from '../../../shared/model/user';
import { Companies } from '../../../shared/model/companies.model';


@Injectable()
export class CompaniesService extends AbstractHttpService {

    constructor(protected http: HttpClient) {
        super(http);
    }
    add(company: Companies) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/company`, company, httpOptions).pipe(
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
                this.apiUrl + '/companies/byemail/'+email, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    findById(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/companies/'+id, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    checkStatusUser(email: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/status/user/'+email, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    updateByRut(id: string, company: Companies) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/companies/update/${id}`, company, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    remove(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(
                this.apiUrl + '/companies/delete/'+id, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    findVehicleListMake() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/vehicle-list/make', httpOptions)
            .pipe(
                map(response => {
                    return response;
            })
        );
    }
    findVehicleListModel() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/vehicle-list/model', httpOptions)
            .pipe(
                map(response => {
                    return response;
            })
        );
    }
    findVehicleListYear() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/vehicle-list/year', httpOptions)
            .pipe(
                map(response => {
                    return response;
            })
        );
    }
    findVehicleListModelByMake(make: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/vehicle-list/make/'+make+'/model', httpOptions)
            .pipe(
                map(response => {
                    return response;
            })
        );
    }
    findVehicleListYearByMakeModel(make: string, model: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        // Codificar make y model
        const encodedMake = encodeURIComponent(make);
        const encodedModel = encodeURIComponent(model);
        const url =
        `${this.apiUrl}/vehicle-list/make/${encodedMake}/model/${encodedModel}/year`;
        return this.http
            .get<any>(url, httpOptions)
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
