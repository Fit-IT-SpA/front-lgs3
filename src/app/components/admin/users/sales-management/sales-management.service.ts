import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../../shared/services/abstract-http.service';
import { map } from 'rxjs/operators';


@Injectable()
export class SalesManagementService extends AbstractHttpService {
    constructor(protected http: HttpClient) {
        super(http);
    }
    findOrders() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/sales-management/orders`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    confirmPayment(offerId: string, productId: string, orderId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/sales-management/order/${orderId}/product/${productId}/offer/${offerId}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
}