import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../shared/services/abstract-http.service';
import { map } from 'rxjs/operators';
import { ConstantService } from '../../../shared/services/constant.service';


@Injectable()
export class ReportService extends AbstractHttpService {

    constructor(protected http: HttpClient) {
        super(http);
    }

    findProductsReport(page : number, parameters: {date: string, status: string}) {
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
        return this.http.post<any>(`${this.apiUrl}/product/report/skip/${skip}/limit/${ConstantService.paginationDesktop}`, parameters, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    countProductsReport(parameters: {date: string, status: string}) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/product/report/count`, parameters, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
}
