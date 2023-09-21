import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from './abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from './constant.service';
import { User } from '../model/user';
import { Order } from '../model/order.model';
import { Offer } from '../model/offer.model';


@Injectable()
export class OfferService extends AbstractHttpService {

    constructor(protected http: HttpClient) {
        super(http);
    }
    add(offer: Offer) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/offer`, offer, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    getOffersByCompanies(companies: any) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/offer/active/`, companies, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    
    getOffersByCompaniesAndEmail(email:string,companies: any) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/offer/active/byemail/`, {email,companies}, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    getCountOffersByEmail(email: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/offer/count/byemail/${email}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    getOffersByEmail(email: string, page : number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        page--;
        let skip: number = 0;
        if (page > 0) {
            skip = ConstantService.paginationDesktop * page;
        }
        return this.http.get<any>(`${this.apiUrl}/offer/byemail/${email}/skip/${skip}/limit/${ConstantService.paginationDesktop}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
   
    updateById(offer: Offer, id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/offer/update/`+id, offer, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    updateStatusById(id: string, status : number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/offer/update/`+id+`/`+status, httpOptions).pipe(
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
        return this.http.delete<any>(`${this.apiUrl}/offer/delete/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    uploadFile(file: FormData) {
        return this.http.post<any>(`${this.apiUrl}/files`, file).pipe(
          map(response => {
            return response;
          })
        );
      }
    updateAllIds(ids: string, qty: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(
                this.apiUrl + '/offer/all/'+ids+'/'+qty, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    
    findByRealId(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/offer/byid/'+id, httpOptions)
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
                this.apiUrl + '/offer/'+id, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    findByIdOrder(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/offer/order/'+id, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    findByIdOrderAndStatus(id: string, status: number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/offer/order/'+id+'/status/'+status, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    findByIdProduct(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/offer/product/'+id, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    findByIdProductAndStatus(id: string, status: number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/offer/product/'+id+'/status/'+status, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
}
