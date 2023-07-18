import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../../shared/services/abstract-http.service';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '../../../../shared/model/role.model';
import { RoleAdd } from '../../../../shared/model/role-add';

import { ConstantService } from '../../../../shared/services/constant.service';
@Injectable()
export class RoleService extends AbstractHttpService {

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
        this.apiUrl + '/roles/count', httpOptions)
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
    return this.http.delete<any>(`${this.apiUrl}/roles/${id}`, httpOptions).pipe(
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
        this.apiUrl + '/roles?filter=' + encodeURIComponent(filter),
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
        this.apiUrl + '/roles?filter=' + encodeURIComponent(filter),
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
        this.apiUrl + '/roles?filter=' + encodeURIComponent(filter),
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
        this.apiUrl + '/roles?filter=' + encodeURIComponent(filter),
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
    return this.http.get<any>(`${this.apiUrl}/roles/${id}`, httpOptions).pipe(
      map(response => {
        return response;
      })
    );
  }
  add(role: RoleAdd) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'      
      })
    };
    return this.http.post<any>(`${this.apiUrl}/roles`, role, httpOptions).pipe(
      map(response => {
        return response;
      })
    );
  }

  update(slug: string, role: RoleAdd) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .put<any>(`${this.apiUrl}/roles/${slug}`, role, httpOptions)
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
