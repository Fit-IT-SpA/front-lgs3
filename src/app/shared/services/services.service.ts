import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from './abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from './constant.service';
import { Service } from '../model/service';

@Injectable()
export class ServicesService extends AbstractHttpService {

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
                this.apiUrl + '/services/count', httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    countWithParams(params : any) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        let filter = "";
        let filter2 = this.configureFilters(params);
        filter = '{"order" : ["createdAt DESC"]';

        if (filter2 === ""){
            filter = filter + '}';
        }
        if (filter2 !== ""){
            filter = filter + ', "where": {' + filter2 + '}}';
        }
        return this.http
            .get<any>(
                this.apiUrl + '/services/count?filter=' + encodeURIComponent(filter), httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    private configureFilters(params : any){
        var filter = "";
        let arrParams = [];

        if (params.serviceName !== ''){
            arrParams.push({ field: 'serviceName', value : Number(params.service) });
        }

        if (params.serviceType !== ''){
            arrParams.push({ field: 'serviceType', value : Number(params.serviceType) });
        }

        for (let i = 0; i < arrParams.length; i ++){
            if (arrParams.length > 1 && i < arrParams.length -1){
                filter =  filter + '"' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + ',';
            }else {
                filter =  filter + '"' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + '';
            }

        }

        return filter;
    }



    findWithParams(params : any, page : number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let skip = 0;
        if (page > 0) {
            skip = ConstantService.paginationDesktop * page;
        }
        let filter = "";
        let filter2 = this.configureFilters(params);

        console.log("filter2: ", filter2);

        filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["createdAt DESC"]';

        if (filter2 === ""){
            filter = filter + '}';
        }
        if (filter2 !== ""){
            filter = filter + ', "where": {' + filter2 + '}}';
        }
        return this.http
            .get<any>(
                this.apiUrl + '/services?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findByServiceType(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        const filter =
            '{"order" : ["createdAt DESC"], "where" : { "and": [{"serviceType": "' + id + '"}]}}';

        return this.http
            .get<any>(
                this.apiUrl + '/services?filter=' + encodeURIComponent(filter),
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
        return this.http.get<any>(`${this.apiUrl}/services/${id}`, httpOptions).pipe(
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
        const filter = '{"order" : ["createdAt DESC"]}';
        return this.http
            .get<any>(
                this.apiUrl + '/services?filter=' + encodeURIComponent(filter), httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    add(service: Service) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/services`, service, httpOptions).pipe(
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
        return this.http.delete<any>(`${this.apiUrl}/services/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    update(id: string, user: Service) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/services/${id}`, user, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }


    addType(service: Service) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/services-type`, service, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    removeType(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.delete<any>(`${this.apiUrl}/services-type/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    updateType(id: string, user: Service) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/services-type/${id}`, user, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }


}
