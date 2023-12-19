import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../shared/services/abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from 'src/app/shared/services/constant.service';


@Injectable()
export class CartService extends AbstractHttpService {
    constructor(protected http: HttpClient) {
        super(http);
    }
    findByEmail(email: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/cart/orders/${email}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    findByOrder(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/cart/order/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    countPurchasesByEmail(email: string, parameters: {date: string, status: string}) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/cart/purchases/orders/count/${email}`, parameters, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    findPurchasesByEmail(email: string, parameters: {date: string, status: string}, page: number) {
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
        return this.http.post<any>(`${this.apiUrl}/cart/purchases/orders/${email}/skip/${skip}/limit/${ConstantService.paginationDesktop}`, parameters, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    confirmedPayment(id: string, parameters: {delivery: string, region: string, commune: string, avenue: string, recipientName: string, recipientLastName: string, photo: string}) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/cart/confirmed-payment/${id}`, parameters, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    confirmProductReceived(offerId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/cart/confirm-received/${offerId}`, httpOptions).pipe(
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
}