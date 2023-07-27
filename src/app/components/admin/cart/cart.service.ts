import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../shared/services/abstract-http.service';
import { map } from 'rxjs/operators';


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
    findPurchases(email: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/cart/purchases/orders/${email}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    confirmedPayment(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/cart/confirmed-payment/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
}