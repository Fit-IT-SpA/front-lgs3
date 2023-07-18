import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../../shared/services/abstract-http.service';
import { map } from 'rxjs/operators';
import { ProductAdd } from '../../../../shared/model/product-add.model'
import { Product } from 'src/app/shared/model/product.model';


@Injectable()
export class ProductsService extends AbstractHttpService {

    constructor(protected http: HttpClient) {
        super(http);
    }
    add(product: ProductAdd) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/product`, product, httpOptions).pipe(
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
        return this.http.get<any>(`${this.apiUrl}/product/order/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    remove(id: string, product: Product) {
        product.status = -1;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/product/${id}`, product, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
        );
    }

}