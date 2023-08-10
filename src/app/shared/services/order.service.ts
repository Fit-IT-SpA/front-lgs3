import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from './abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from './constant.service';
import { User } from '../model/user';
import { Order } from '../model/order.model';
import { OrderAdd } from '../model/order-add.model';


@Injectable()
export class OrderService extends AbstractHttpService {

    constructor(protected http: HttpClient) {
        super(http);
    }
    add(order: OrderAdd) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/order`, order, httpOptions).pipe(
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
        return this.http
            .get<any>(
                this.apiUrl + '/order/email/'+email, httpOptions)
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
    
    findOfferByMail(email: string, brand: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/product/byemail/filter/'+email+'/'+brand, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

}
