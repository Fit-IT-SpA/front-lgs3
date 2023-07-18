import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AbstractHttpService } from '../../../../shared/services/abstract-http.service';
import { ConstantService } from '../../../../shared/services/constant.service';
import { PrivilegeAdd } from '../../../../shared/model/privilege-add';

@Injectable({
    providedIn: 'root'
})
export class PrivilegeService extends AbstractHttpService {

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
                this.apiUrl + '/privileges/count', httpOptions)
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
        return this.http.delete<any>(`${this.apiUrl}/privileges/${id}`, httpOptions).pipe(
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
        let filter = '{ "order": [ "title ASC"]}';
        return this.http
            .get<any>(
                this.apiUrl + '/privileges?filter=' + encodeURIComponent(filter),
                httpOptions
            )
            .pipe(
                map(response => {
                    return response;
                })
            );
    }

    find(page: number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let skip = 0;
        if (page > 0) {
            skip = ConstantService.paginationDesktop * page;
        }
        let filter = '{ "skip": "' + skip + '", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["page ASC"]}';
        return this.http
            .get<any>(
                this.apiUrl + '/privileges?filter=' + encodeURIComponent(filter),
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
                this.apiUrl + '/privileges?filter=' + encodeURIComponent(filter),
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
        return this.http.get<any>(`${this.apiUrl}/privileges/${id}`, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    add(privilege: PrivilegeAdd) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<any>(`${this.apiUrl}/privileges`, privilege, httpOptions).pipe(
            map(response => {
                return response;
            })
        );
    }

    update(slug: string, privilege: PrivilegeAdd) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http
            .put<any>(`${this.apiUrl}/privileges/${slug}`, privilege, httpOptions)
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
