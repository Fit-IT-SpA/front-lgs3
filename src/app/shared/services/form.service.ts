import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from './abstract-http.service';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Form } from '../model/form';
import { FormAdd } from '../model/form-add';

import { ConstantService } from './constant.service';
@Injectable()
export class FormService extends AbstractHttpService {

    constructor(protected http: HttpClient) {
        super(http);
    }

    count() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/forms/count', httpOptions)
            .pipe(
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
        return this.http.delete<any>(`${this.apiUrl}/forms/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    findAll() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let filter = '{ "order": [ "createdAt DESC"]}';
        return this.http
            .get<any>(
                this.apiUrl + '/forms?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findByRutCount(rut : string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .get<any>(
                this.apiUrl + '/forms/my/' + rut + '/count',
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findByRut(rut : string, page: number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let skip = 0;
        if (page > 0) {
            skip = ConstantService.paginationDesktop * page;
        }
        return this.http
            .get<any>(
                this.apiUrl + `/forms/my/` + rut + `/${skip}/${ConstantService.paginationDesktop}`,
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findAllActive() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let filter = '{ "where": { "status" : 1 }, "order": [ "title ASC"]}';
        return this.http
            .get<any>(
                this.apiUrl + '/forms?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    find(page : number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let skip = 0;
        if (page > 0) {
            skip = ConstantService.paginationDesktop * page;
        }
        let filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["name ASC"]}';
        return this.http
            .get<any>(
                this.apiUrl + '/forms?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    findByName(name: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        const filter =
            '{ "where" : { "title": "' + name + '"}}';
        return this.http
            .get<any>(
                this.apiUrl + '/forms?filter=' + encodeURIComponent(filter),
                httpOptions
            )
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
        return this.http.get<any>(`${this.apiUrl}/forms/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    findHistoryCount(user: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/forms/my-history/${user}/count`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    /** Request */
    findTicketsHistoryCount(user: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/forms/request-history/${user}/count`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    /** Request */
    findTicketsHistoryByUser(user: string, page : number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let skip = 0;
        if (page > 1) {
            skip = ConstantService.paginationDesktop * (page - 1);
        }
        return this.http.get<any>(`${this.apiUrl}/forms/request-history/${user}/${skip}/${ConstantService.paginationDesktop}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    /** Request */
    findTicketsUnassignedCount(user: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<any>(`${this.apiUrl}/forms/request-unassigned/${user}/count`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    /** Request */
    findTicketsUnassignedByUser(user: string, page : number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let skip = 0;
        if (page > 1) {
            skip = ConstantService.paginationDesktop * (page - 1);
        }
        return this.http.get<any>(`${this.apiUrl}/forms/request-unassigned/${user}/${skip}/${ConstantService.paginationDesktop}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    findHistoryByUser(user: string, page : number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let skip = 0;
        if (page > 0) {
            skip = ConstantService.paginationDesktop * page;
        }
        return this.http.get<any>(`${this.apiUrl}/forms/my-history/${user}/${skip}/${ConstantService.paginationDesktop}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }
    add(form: FormAdd) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/forms`, form, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    update(slug: string, form: FormAdd) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/forms/${slug}`, form, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    questions(slug: string, questions: String[]) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/forms/questions/${slug}`, questions, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    approve(slug: string, vigencyAt: String) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/forms/approve/${slug}`, { vigencyAt: vigencyAt}, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    suspend(slug: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/forms/suspend/${slug}`, {}, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    delete(slug: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/forms/delete/${slug}`, { }, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    uploadImage(file: any) {
        const httpOptions = {
            headers: new HttpHeaders({
                Content: 'multipart/form-data'
            })
        };

        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        return this.http
            .post<any>(`${this.apiUrl}/fileupload`, formData, httpOptions)
            .pipe(
                map(response => {
                    return response;
                })
            );
    }
}
