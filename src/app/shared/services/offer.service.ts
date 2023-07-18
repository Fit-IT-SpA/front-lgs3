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
    add(order: Offer, id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/offer/`+id, order, httpOptions).pipe(
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
    remove(id: string, order:string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(
                this.apiUrl + '/offer/delete/'+id+'/'+order, httpOptions)
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
}
