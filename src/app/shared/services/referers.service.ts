import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from './abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from './constant.service';
import { Referer } from '../model/referer';
import { Faq } from '../model/faq';


@Injectable()
export class ReferersService extends AbstractHttpService {

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
                this.apiUrl + '/my-surveys/count', httpOptions)
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
        let filter3 = this.configureFullnameFilters(params);
        filter = '{"order" : ["createdAt DESC"]';

        if (filter2 === "" && filter3 === ""){
            filter = filter + '}';
        }
        if (filter2 !== "" && filter3 === ""){
            filter = filter + ', "where": {' + filter2 + '}}';
        }
        if (filter2 === "" && filter3 !== ""){
            filter = filter + ', "where": { "or": [' + filter3 + ']}}';
        }
        if (filter2 !== "" && filter3 !== ""){
            filter = filter + ', "where": { "and": [ {' + filter2 + '}, { "or": [' + filter3 + '] } ] }}';
        }
        return this.http
            .get<any>(
                this.apiUrl + '/referers/count?filter=' + encodeURIComponent(filter), httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findByService(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        const filter =
            '{"order" : ["createdAt DESC"], "where" : { "and": [{"service": "' + id + '"}]}}';

        return this.http
            .get<any>(
                this.apiUrl + '/promotions?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findScoreByRut(codigo_andes: string, codigo_tango: string,) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/user-score/' + codigo_andes+'/'+codigo_tango,
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findScoreByRutAll(codigo_andes: string, codigo_tango: string,) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/user-score/all/' + codigo_andes+'/'+codigo_tango,
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    private configureFilters(params : any){
        var filter = "";
        let arrParams = [];
        if (params.rut !== ''){
            arrParams.push({ field: 'rut', value : params.rut });
        }

        if (params.serviceType !== ''){
            arrParams.push({ field: 'serviceType', value : params.serviceType });
        }

        if (params.service !== ''){
            arrParams.push({ field: 'service', value : params.service });
        }

        if (params.status !== ''){
            arrParams.push({ field: 'status', value : Number(params.status) });
        }

        if (params.referent !== '' && params.referent){
            arrParams.push({ field: 'referent', value : params.referent });
        }

        if (params.seller !== '' && params.seller){
            arrParams.push({ field: 'seller', value : params.seller });
        }

        for (let i = 0; i < arrParams.length; i ++){
            if (arrParams.length > 1 && i < arrParams.length -1){
                filter =  filter + '"' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + ',';
            }else {
                filter =  filter + '"' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + '';
            }

        }

        if(params.date !== '' && params.date && params.date != "-01 00:00:00") {
            console.log("ParamsDate: " + params.date);
            var date = new Date(params.date), y = date.getFullYear(), m = date.getMonth();
            var firstDay = new Date(y, m, 1);
            var lastDay = new Date(y, m + 1, 0);
            firstDay.setUTCHours(0,0,0,0);
            lastDay.setUTCHours(23,59,59,0);
            filter = filter + ', "and" : [ {"createdAt" : { "gt": "' + firstDay.toISOString() + '"}}, {"createdAt" : { "lt": "' + lastDay.toISOString() + '"}}]';

        }

        return filter;
    }

    configureFullnameFilters(params : any){
        var filter = "";
        let arrParams = [];

        if (params.fullname !== ''){
            let arrName = params.fullname.split(' ');
            if (arrName.length === 1){
                arrParams.push({ field: 'name', value : { "like": arrName[0], options: "i"}});
                arrParams.push({ field: 'lastName', value : { "like": arrName[0], options: "i"}});
                arrParams.push({ field: 'secondLastName', value : { "like": arrName[0], options: "i"}});

            } else if (arrName.length === 2){
                arrParams.push({ field: 'name', value : { "like": arrName[0], options: "i"}});
                arrParams.push({ field: 'lastName', value : { "like": arrName[1], options: "i"}});
                arrParams.push({ field: 'secondLastName', value : { "like": arrName[1], options: "i"}});
            } if (arrName.length === 3){
                arrParams.push({ field: 'name', value : { "like": arrName[0], options: "i"}});
                arrParams.push({ field: 'lastName', value : { "like": arrName[1], options: "i"}});
                arrParams.push({ field: 'secondLastName', value : { "like":arrName[2], options: "i"}});
            }
        }

        for (let i = 0; i < arrParams.length; i ++){
            if (arrParams.length > 1 && i < arrParams.length -1){
                if (arrParams[i].field === 'name' || arrParams[i].field === 'lastName' || arrParams[i].field === 'secondLastName'){
                    filter =  filter + '{"' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + '},';
                }
            } else {
                if (arrParams[i].field === 'name' || arrParams[i].field === 'lastName' || arrParams[i].field === 'secondLastName'){
                    filter =  filter + '{ "' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + '}';
                }
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
        let filter3 = this.configureFullnameFilters(params);

        filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["createdAt DESC"]';

        if (filter2 === "" && filter3 === ""){
            filter = filter + '}';
        }
        if (filter2 !== "" && filter3 === ""){
            filter = filter + ', "where": {' + filter2 + '}}';
        }
        if (filter2 === "" && filter3 !== ""){
            filter = filter + ', "where": { "or": [' + filter3 + ']}}';
        }
        if (filter2 !== "" && filter3 !== ""){
            filter = filter + ', "where": { "and": [ {' + filter2 + '}, { "or": [' + filter3 + '] } ] }}';
        }

        console.log("filter: " + filter);
        console.log("filter2: " + filter2);
        console.log("filter3: " + filter3);

        return this.http
            .get<any>(
                this.apiUrl + '/referers?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findByRut(rut: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        const filter =
            '{ "where" : { "rut": "' + rut + '"}}';
        return this.http
            .get<any>(
                this.apiUrl + '/referers?filter=' + encodeURIComponent(filter),
                httpOptions
            )
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
        const filter =
            '{ "where" : { "email": "' + email + '"}}';
        return this.http
            .get<any>(
                this.apiUrl + '/users?filter=' + encodeURIComponent(filter),
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
        return this.http.get<any>(`${this.apiUrl}/referers/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }


    findFaqById(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/faq/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    findServices(id:string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        const filter =
            '{ "where" : { "serviceType": "' + id + '"}}';
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

    findServiceById(id:string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        const filter =
            '{ "where" : { "id": "' + id + '" }}';
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


    getPeriods() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/referers/periods',
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    getProfits(referent:string, months:number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/referers/allprofits/' + referent + "/" + months,
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
    getMonthProfits(referent:string, year:number, month:number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/referers/profits/' + referent + "/" + year + "/" + month,
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    add(referer: Referer) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/referers`, referer, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    addFaq(faq: Faq) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/faq`, faq, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    remove(rut: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.delete<any>(`${this.apiUrl}/referers/${rut}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    update(id: string, user: Referer) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/referers/${id}`, user, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findFaqs() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        const filter = '{"order" : ["createdAt DESC"]}';
        return this.http
            .get<any>(
                this.apiUrl + '/faq?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    updateFaq(id: string, faq: Faq) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/faq/${id}`, faq, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    removeFaq(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .delete<any>(`${this.apiUrl}/faq/${id}`, httpOptions)
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
