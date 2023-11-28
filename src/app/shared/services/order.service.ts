import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from './abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from './constant.service';
import { User } from '../model/user';
import { Order } from '../model/order.model';
import { OrderAdd } from '../model/order-add.model';
import { Product } from '../model/product.model';
import { Companies } from '../model/companies.model';


@Injectable()
export class OrderService extends AbstractHttpService {

    constructor(protected http: HttpClient) {
        super(http);
    }
    add(addOrder: {order: OrderAdd, products: Product[], company: Companies}) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/order`, addOrder, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    countByEmail(email: string, parameters: {date: string, status: string}) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .post<any>(
                this.apiUrl + '/order/count/email/'+email, parameters, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
    
    findByEmail(email: string, parameters: {date: string, status: string}, page: number) {
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
        return this.http
            .post<any>(
                this.apiUrl + '/order/email/'+email+'/skip/'+skip+'/limit/'+ConstantService.paginationDesktop, parameters, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
    findByEmailAndRut(email: string, rut: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/order/'+email+'/'+rut, httpOptions)
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
                this.apiUrl + '/order/'+id, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
    findWithProductById(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/order/'+id+'/product', httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
    updateById(order: Order, id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/order/`+id, order, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    updateOrderById(order: OrderAdd, id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<any>(`${this.apiUrl}/order/update/`+id, order, httpOptions).pipe(
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
                this.apiUrl + '/order/delete/'+id, httpOptions)
            .pipe(
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

    private completeZero(value){
        if (Number.parseInt(value) < 10){
            return "0" + value;
        }
        return value;
    }
    
     findByIdOrder(idOrder: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/product/'+idOrder, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
        
    findByAll() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/product/', httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
    countProcutsNotOfferByMail(email: string, parameters: {date: string, brand: string[]}) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .post<any>(
                this.apiUrl + '/product/count/not-offer/byemail/'+email, parameters, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    findProductsNotOfferByMail(email: string, page: number, parameters: {date: string, brand: string[]}) {
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
        return this.http
            .post<any>(
                this.apiUrl + '/product/not-offer/byemail/'+email+'/skip/'+skip+'/limit/'+ConstantService.paginationDesktop, parameters, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }
    findProductById(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/product/'+id, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

}
