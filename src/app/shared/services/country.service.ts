import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from './abstract-http.service';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../model/country';
import { ConstantService } from './constant.service';

@Injectable()
export class CountryService extends AbstractHttpService {

    constructor(protected http: HttpClient) {
        super(http);
    }

    count() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/countries/count', httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    remove(id: string, token: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: token
            })
        };
        return this.http.delete<any>(`${this.apiUrl}/countries/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    findAll() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let filter = '{ "order": [ "name ASC"]}';
        return this.http
            .get<any>(
                this.apiUrl + '/countries?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    find(page : number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let skip = 0;
        if (page >= 1) {
            skip = ConstantService.paginationDesktop * page;
        }
        let filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["createdAt DESC"]}';
        return this.http
            .get<any>(
                this.apiUrl + '/countries?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findByName(name: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        const filter =
            '{ "where" : { "title": "' + name + '", "linkDerivation": ""}}';
        return this.http
            .get<any>(
                this.apiUrl + '/countries?filter=' + encodeURIComponent(filter),
                httpOptions
            )
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
        return this.http.get<any>(`${this.apiUrl}/countries/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    add(country: Country, token: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: token
            })
        };
        return this.http.post<any>(`${this.apiUrl}/countries`, country, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    update(id: string, country: Country, token: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: token
            })
        };
        return this.http
            .patch<any>(`${this.apiUrl}/countries/${id}`, country, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
}
