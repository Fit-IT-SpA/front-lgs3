import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../../shared/services/abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from 'src/app/shared/services/constant.service';


@Injectable()
export class SalesManagementService extends AbstractHttpService {
    constructor(protected http: HttpClient) {
        super(http);
    }
    countOrdersSales(parameters: {date: string, status: string}) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/sales-management/count/orders`, parameters, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    findOrdersSales(parameters: {date: string, status: string}, page: number) {
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
        return this.http.post<any>(`${this.apiUrl}/sales-management/orders/skip/${skip}/limit/${ConstantService.paginationDesktop}`, parameters, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    confirmPayment(offerId: string, productId: string, orderId: string, photo: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/sales-management/order/${orderId}/product/${productId}/offer/${offerId}`, {photo: photo}, httpOptions).pipe(
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