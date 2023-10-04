import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../../shared/services/abstract-http.service';
import { map } from 'rxjs/operators';


@Injectable()
export class DeliveryService extends AbstractHttpService {
    constructor(protected http: HttpClient) {
        super(http);
    }
    findOrders() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/delivery/orders`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    confirmDelivered(offerId: string, productId: string, orderId: string, photo: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/delivery/order/${orderId}/product/${productId}/offer/${offerId}`, {photo: photo}, httpOptions).pipe(
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