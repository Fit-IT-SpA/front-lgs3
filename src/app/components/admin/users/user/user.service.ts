import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { AbstractHttpService } from "../../../../shared/services/abstract-http.service";
import { User } from '../../../../shared/model/user';
import { UserAdd } from '../../../../shared/model/user-add';
import { ConstantService } from '../../../../shared/services/constant.service';

@Injectable({
	providedIn: "root",
})
export class UserService extends AbstractHttpService {
	constructor(protected http: HttpClient) {
		super(http);
	}

	getUserList(limit?: number, page?: number) {
		return this.http.get<User[]>(`${this.apiUrl}/users`, {
			params: {
				limit: limit ? limit.toString() : "10",
				page: page ? page.toString() : "0",
			},
		});
	}

	deleteUser(rut: string) {
		return this.http.delete(`${this.apiUrl}/users/${rut}`);
	}
	remove(id: string) {
		const httpOptions = {
		  headers: new HttpHeaders({
			'Content-Type': 'application/json'
		  })
		};
		return this.http.delete<any>(`${this.apiUrl}/users/${id}`, httpOptions).pipe(
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
		let filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["createdAt DESC"], "where": {"status": {"ne": -1}} }';
		return this.http
		  .get<any>(
			this.apiUrl + '/users?filter=' + encodeURIComponent(filter),
			httpOptions
		  )
		  .pipe(
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
	
		let filter = '{ "order" : ["createdAt DESC"], "where": {"status": {"ne": -1}} }';
		return this.http
		  .get<any>(
			this.apiUrl + '/users?filter=' + encodeURIComponent(filter),
			httpOptions
		  )
		  .pipe(
			map(response => {
			  return response;
			})
		  );
	  }
	
	  count() {
		const httpOptions = {
		  headers: new HttpHeaders({
			'Content-Type': 'application/json'
		  })
		};
		return this.http
		  .get<any>(
			this.apiUrl + '/users/count', httpOptions)
		  .pipe(
			map(response => {
			  return response;
			})
		  );
	  }
	  countWithParams(params : any) {
		const httpOptions = {
		  headers: new HttpHeaders({
			'Content-Type': 'application/json'
		  })
		};
	
		let filter = "";
		let filter2 = this.configureFilters(params);
		let filter3 = this.configureFullnameFilters(params);
		filter = '{"order" : ["createdAt DESC"]';
	
		if (filter2 === "" && filter3 === ""){
		  filter = filter + '}';
		}
		if (filter2 !== "" && filter3 === ""){
		  filter = filter + ', "where": { "and": [ {' + filter2 + '}] }}';
		}
		if (filter2 === "" && filter3 !== ""){
		  filter = filter + ', "where": { "and": [ {"or": [' + filter3 + ']} ]}}';
		}
		if (filter2 !== "" && filter3 !== ""){
		  filter = filter + ', "where": { "and": [ {' + filter2 + '}, { "or": [' + filter3 + '] } ] }}';
		}
		return this.http
		  .get<any>(
			this.apiUrl + '/users/count?filter=' + encodeURIComponent(filter), httpOptions)
		  .pipe(
			map(response => {
			  return response;
			})
		  );
	  }
	
	  private configureFilters(params : any){
		var filter = "";
		let arrParams = [];
		if (params.rut !== ''){
		  arrParams.push({ field: 'rut', value : params.rut });
		}
		if (params.role !== ''){
		  arrParams.push({ field: 'role', value : params.role });
		}
	
		for (let i = 0; i < arrParams.length; i ++){
		  if (arrParams.length > 1 && i < arrParams.length -1){
			if (arrParams[i].field === 'createdAt'){
			  filter =  filter + '"' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + ',';
			} else {
			  filter =  filter + '"' + arrParams[i].field + '": "' + arrParams[i].value + '",';
			}
		  } else {
			if (arrParams[i].field === 'createdAt'){
			  filter =  filter + ' "' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + '';
			} else {
			  filter =  filter + '"' + arrParams[i].field + '": "' + arrParams[i].value + '"';
			}
	
		  }
		}
		return filter;
	  }
	
	  configureFullnameFilters(params : any){
		var filter = "";
		let arrParams = [];
		
		if (params.fullname !== ''){
		  let arrName = params.fullname.split(' ');
		  if (arrName.length === 1){
			arrParams.push({ field: 'name', value : { "like": arrName[0], options: "i"}});
			arrParams.push({ field: 'lastName', value : { "like": arrName[0], options: "i"}});
			arrParams.push({ field: 'secondLastName', value : { "like": arrName[0], options: "i"}});
	
		  } else if (arrName.length === 2){
			arrParams.push({ field: 'name', value : { "like": arrName[0], options: "i"}});
			arrParams.push({ field: 'lastName', value : { "like": arrName[1], options: "i"}});
			arrParams.push({ field: 'secondLastName', value : { "like": arrName[1], options: "i"}});
		  } if (arrName.length === 3){
			arrParams.push({ field: 'name', value : { "like": arrName[0], options: "i"}});
			arrParams.push({ field: 'lastName', value : { "like": arrName[1], options: "i"}});
			arrParams.push({ field: 'secondLastName', value : { "like":arrName[2], options: "i"}});
		  }
		} 
	
		for (let i = 0; i < arrParams.length; i ++){
		  if (arrParams.length > 1 && i < arrParams.length -1){
			if (arrParams[i].field === 'name' || arrParams[i].field === 'lastName' || arrParams[i].field === 'secondLastName'){
			  filter =  filter + '{"' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + '},';
			} 
		  } else {
			if (arrParams[i].field === 'name' || arrParams[i].field === 'lastName' || arrParams[i].field === 'secondLastName'){
			  filter =  filter + '{ "' + arrParams[i].field + '": ' + JSON.stringify(arrParams[i].value) + '}';
			} 
		  }
		}
		return filter;
	  }
	
	  findWithParams(params : any, page : number) {
		const httpOptions = {
		  headers: new HttpHeaders({
			'Content-Type': 'application/json'
		  })
		};
		let skip = 0;
		if (page > 0) {
		  skip = ConstantService.paginationDesktop * page;
		}
		let filter = "";
		let filter2 = this.configureFilters(params);
		let filter3 = this.configureFullnameFilters(params);
		filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["createdAt DESC"]';
	
		if (filter2 === "" && filter3 === ""){
		  filter = filter + '}';
		}
		if (filter2 !== "" && filter3 === ""){
		  filter = filter + ', "where": { "and": [ {' + filter2 + '} ] }}';
		}
		if (filter2 === "" && filter3 !== ""){
		  filter = filter + ', "where": { "and": [ {"or": [' + filter3 + ']} ]}}';
		}
		if (filter2 !== "" && filter3 !== ""){
		  filter = filter + ', "where": { "and": [ {' + filter2 + '}, { "or": [' + filter3 + '] } ] }}';
		}
		return this.http
		  .get<any>(
			this.apiUrl + '/users?filter=' + encodeURIComponent(filter),
			httpOptions
		  )
		  .pipe(
			map(response => {
			  return response;
			})
		  );
	  }
	
	  findByRut(rut: string) {
		const httpOptions = {
		  headers: new HttpHeaders({
			'Content-Type': 'application/json'
		  })
		};
		const filter =
		  '{ "where" : {"and" : [{ "rut": "' + rut + '"}, {"status": {"ne": -1}}] }}';
		return this.http
		  .get<any>(
			this.apiUrl + '/users?filter=' + encodeURIComponent(filter),
			httpOptions
		  )
		  .pipe(
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
		const filter =
		  '{ "where" : {"and" : [{ "email": "' + email + '"}, {"status": {"ne": -1}}] }}';
		return this.http
		  .get<any>(
			this.apiUrl + '/users?filter=' + encodeURIComponent(filter),
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
		return this.http.get<any>(`${this.apiUrl}/users/${id}`, httpOptions).pipe(
		  map(response => {
			return response;
		  })
		);
	  }
	  add(user: UserAdd) {
		const httpOptions = {
		  headers: new HttpHeaders({
			'Content-Type': 'application/json'
		  })
		};
		return this.http.post<any>(`${this.apiUrl}/users`, user, httpOptions).pipe(
		  map(response => {
			return response;
		  })
		);
	  }
	
	  update(id: string, user: User) {
		const httpOptions = {
		  headers: new HttpHeaders({
			'Content-Type': 'application/json'
		  })
		};
		return this.http
		  .put<any>(`${this.apiUrl}/users/${id}`, user, httpOptions)
		  .pipe(
			map(response => {
			  return response;
			})
		  );
	  }
	
	  changeStatus(rut: string, status: number) {
		const httpOptions = {
		  headers: new HttpHeaders({
			'Content-Type': 'application/json'
		  })
		};
		return this.http
		  .put<any>(`${this.apiUrl}/users/status/${rut}/${status}`, {}, httpOptions)
		  .pipe(
			map(response => {
			  return response;
			})
		  );
	  }
	
	  getCurrentUser(){
		const httpOptions = {
		  headers: new HttpHeaders({
			'Content-Type': 'application/json'
		  })
		};
		return this.http.get<any>(`${this.apiUrl}/users/current`, httpOptions).pipe(
		  map(response => {
			console.log(response);
			let profile = JSON.parse(localStorage.getItem("profile"));
			
			response['token'] = profile.token;
			localStorage.setItem('profile', JSON.stringify(response));
			return response;
		  },catchError(err => {
			return of(false);
		  })     
		));
	  }
	
	  private completeZero(value){
		if (Number.parseInt(value) < 10){
		  return "0" + value;
		}
		return value;
	  }
}
