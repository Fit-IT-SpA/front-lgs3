import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractHttpService } from '../../../../shared/services/abstract-http.service';
import { map, catchError } from 'rxjs/operators';
import { ConstantService } from '../../../../shared/services/constant.service';
@Injectable()
export class TrxLogsService extends AbstractHttpService {

  constructor(protected http: HttpClient) {
    super(http);
  } 

  find(page : number, pageSize : number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    let skip = 0;
    if (page > 0) {
      skip = pageSize * page;
    }
    let filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["createdAt  DESC"]}';
    return this.http
      .get<any>(
        this.apiUrl + '/trx-logs?filter=' + encodeURIComponent(filter),
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  findLogs(page: number, pageSize: number){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    let skip = 0;
    if (page > 0) {
      skip = pageSize * page;
    }
    let filter = '{ "skip": "' + skip + '", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["createdAt  DESC"]}';
    return this.http
      .get<any>(
        this.apiUrl + '/trx-logs?filter=' + encodeURIComponent(filter),
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  countWithParams(params: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    let filter = '';
    let filter2 = this.configureFilters(params);
    let filter3 = '';
    filter = '{"order" : ["userId DESC"]';

    /*if (params.name !== "") {
      filter3 = this.configureFullnameFilters(params);
    }*/

    if (filter2 === "" && filter3 === "") {
      filter = filter + '}';
    }
    if (filter2 !== "" && filter3 === "") {
      filter = filter + ', "where": {"and": [ {' + filter2 + '}]}}';
    }
    if (filter2 === "" && filter3 !== "") {
      filter = filter + ', "where": {"and": [ {"or": [' + filter3 + ']}}';
    }
    if (filter2 !== "" && filter3 !== "") {
      filter = filter + ', "where": {"and": [ {' + filter2 + '}, { "or": [' + filter3 + ']}]}}';
    }

  
    if (filter2 === "" && filter3 !== "") {
      filter = filter + ', "where": { "and": [ {"or": [' + filter3 + ']}, {"userId": {"ne": -1}} ]}}';
    }
    console.log(filter)
    filter2 = "";

    return this.http
      .get<any>(
        this.apiUrl + '/trx-logs/countWithParams?filter=' + encodeURIComponent(filter), httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      )
  }


  private configureFilters(params: any) {
    var filter = "";
    let arrParams = [];

    //Se añaden al array los parámetros elegidos
    if (params.module !== '' && params.module.length > 0) {
      arrParams.push({ field: 'module', value: params.module });
    }
    if (params.trxType !== '' && params.trxType.length > 0) {
      arrParams.push({ field: 'trxType', value: params.trxType });
    }
    if (params.dateLogStart !== '') {
      arrParams.push({ field: 'dateLogStart', value: params.dateLogStart });
    }
    if (params.dateLogEnd !== '') {
      arrParams.push({ field: 'dateLogEnd', value: params.dateLogEnd });
    }

    console.log(arrParams)

    for (let i = 0; i < arrParams.length; i++) {

      //Se eligen 2 parámetros
      if (arrParams.length == 2) {
        if (arrParams[i].field === 'module' && arrParams[i + 1].field === 'trxType') {
          filter = filter + ' "' + arrParams[i].field + '":{"in": ' + JSON.stringify(arrParams[i].value) + '}},{"' + arrParams[i + 1].field + '":{"in": ' + JSON.stringify(arrParams[i + 1].value) + '}';
          return filter;
        } else if ((arrParams[i].field === 'module' || arrParams[i].field === 'trxType') && arrParams[i + 1].field === 'dateLogStart') {
          filter = filter + '"' + arrParams[i].field + '":{"in": ' + JSON.stringify(arrParams[i].value) + '}' + filter + ', "createdAt": {"gte": "' + arrParams[i + 1].value + '"}';
          return filter;
        } else if ((arrParams[i].field === 'module' || arrParams[i].field === 'trxType') && arrParams[i + 1].field === 'dateLogEnd') {
          filter = filter + '"' + arrParams[i].field + '":{"in": ' + JSON.stringify(arrParams[i].value) + '}' + filter + ', "createdAt": {"lte": "' + arrParams[i + 1].value + '"}';
          return filter;
        }
      }
      //Se eligen 3 parámetros
      else if(arrParams.length == 3){//Módulo o tipo y dos fechas
        if (arrParams[0].field === 'module' && arrParams[1].field !== 'trxType'){
          filter = filter + '"module":{"in": ' + JSON.stringify(arrParams[0].value) + '}' + ', "createdAt": {"gte": "' + arrParams[1].value + '"}}' + ', {"createdAt": {"lte": "' + arrParams[2].value + '"}';
          return filter;
        } else if (arrParams[0].field === 'trxType'){
          filter = filter + '"trxType":{"in": ' + JSON.stringify(arrParams[0].value) + '}' + ', "createdAt": {"gte": "' + arrParams[1].value + '"}}' + ', {"createdAt": {"lte": "' + arrParams[2].value + '"}';
          return filter;
        }//Módulo, tipo y fecha de inicio
        else if(arrParams[0].field === 'module' && arrParams[1].field === 'trxType' && arrParams[2].field === 'dateLogStart'){
          filter = filter + '"module":{"in": ' + JSON.stringify(arrParams[0].value) + '}' + ',"trxType":{"in": ' + JSON.stringify(arrParams[1].value) + '}' + ', "createdAt": {"gte": "' + arrParams[2].value + '"}';
          return filter;
        }//Módulo, tipo y fecha final
        else if (arrParams[0].field === 'module' && arrParams[1].field === 'trxType' && arrParams[2].field === 'dateLogEnd'){
          filter = filter + '"module":{"in": ' + JSON.stringify(arrParams[0].value) + '}' + ',"trxType":{"in": ' + JSON.stringify(arrParams[1].value) + '}' + ', "createdAt": {"lte": "' + arrParams[2].value + '"}';
          return filter;
        }
      }
      //Todos los parametros son elegidos
      else if(arrParams.length == 4){
        filter = '"module":{"in": ' + JSON.stringify(arrParams[0].value) + '}'+ ', "trxType":{"in": ' + JSON.stringify(arrParams[1].value) + '}' + ', "createdAt": {"gte": "' + arrParams[2].value + '"}}' + 
        ', {"createdAt": {"lte": "' + arrParams[3].value + '"}';
        return filter;
      }

      if (arrParams.length > 1 && i < arrParams.length - 1) {
        if (arrParams[i].field === 'module') {
          filter = filter + '"' + arrParams[i].field + '":{"in": ' + JSON.stringify(arrParams[i].value) + '}';
        } else {
          if (arrParams[i].field === 'trx') {
            filter = filter + '"' + arrParams[i].field + '":{"in": ' + JSON.stringify(arrParams[i].value) + '}';
          }
        }
      } else if (arrParams[i].value.length == 1) {
        if (arrParams[i].field === 'module') {
          filter = filter + ' "' + arrParams[i].field + '":{"eq": "' + arrParams[i].value + '"}';
        } else {
          if (arrParams[i].field === 'trxType') {
            filter = filter + ' "' + arrParams[i].field + '":{"eq": "' + arrParams[i].value + '"}';
          }
        }
      } else if (arrParams[i].value.length > 1) {
        if (arrParams[i].field === 'module') {
          filter = filter + ' "' + arrParams[i].field + '":{"in": ' + JSON.stringify(arrParams[i].value) + '}';
        } else if (arrParams[i].value.length > 1 && arrParams[i].field === 'trxType') {
          filter = filter + ' "' + arrParams[i].field + '":{"in": ' + JSON.stringify(arrParams[i].value) + '}';
        }
      }
      if (arrParams[i].field === 'dateLogStart' && arrParams[i].value.length > 1) {
        filter = filter + ' "createdAt": {"gte": "' + arrParams[i].value + '"}';
      }
      else {
        if (!arrParams[i - 1] && arrParams[i].field === 'dateLogEnd' && arrParams[i].value.length > 1) {
          filter = filter + ' "createdAt": {"lte": "' + arrParams[i].value + '"}';
        }
        else if ((arrParams[i - 1] && arrParams[i].field === 'dateLogEnd' && arrParams[i].value.length > 1)) {
          filter = filter + '}, {"createdAt": {"lte": "' + arrParams[i].value + '"}';
        }
      }
    }
    return filter;
  }

  countWithFilter(params: { name: string, module: string, trxType: string, details: string, dateLogStart: string, dateLogEnd: string }) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .post<any>(
        this.apiUrl + '/trx-logs/count-with-filter', params, httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );

  }

  findWithParams(params: { name: string, module: string, trxType: string, details: string, dateLogStart: string, dateLogEnd: string }, page: number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    page--;
    let skip = 0;
    if (page > 0) {
      skip = ConstantService.paginationDesktop * page;
    }
    return this.http
      .post<any>(
        this.apiUrl + '/trx-logs/find-with-filter/skip/'+skip+'/limit/'+ConstantService.paginationDesktop, params, httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );

  }
  
  findWithParamsGroup() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http
      .get<any>(
        this.apiUrl + '/trx-logs/group-by-params',
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  findModules() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http
      .get<any>(
        this.apiUrl + '/trx-logs/find-all-modules',
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  findAllTrxTypesOfModule(module: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http
      .get<any>(
        this.apiUrl + '/trx-logs/module/'+module+'/find-all-trx-types',
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }
    
  findWithParamsToExcel(params: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    let filter = '';
    let filter2 = this.configureFilters(params);
    let filter3 = '';
    filter = '{ ';

    /*if (params.name !== "") {
      filter3 = this.configureFullnameFilters(params);
    }*/

    console.log(filter2)
    if (filter2 === "" && filter3 === "") {
      filter = filter + '}';
    }
    if (filter2 !== "" && filter3 === "") {
      filter = filter + ' "where": { "and": [ {' + filter2 + '}]}}';
    }
    if (filter2 === "" && filter3 !== "") {
      filter = filter + ' "where": { "and": [ {"or": [' + filter3 + ']}]}}';
    }
    if (filter2 !== "" && filter3 !== "") {
      filter = filter + ' "where": { "and": [ {' + filter2 + '}, { "or": [' + filter3 + ']}]}}';
    }

    console.log(filter);

    return this.http
      .get<any>(
        this.apiUrl + '/trx-logs?filter=' + encodeURIComponent(filter),
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

    let filter = '{ "order" : ["FECHAREG DESC"]}';
    return this.http
      .get<any>(
        this.apiUrl + '/ctrcelular?filter=' + encodeURIComponent(filter),
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
        this.apiUrl + '/ctrcelular/count', httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  countLogs(){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
    .get<any>(
      this.apiUrl + '/trx-logs/count', httpOptions)
    .pipe(
      map( response =>{
        return response
      })
    );
  }

  postLog(trxlog: any){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<any>(`${this.apiUrl}/trx-logs`, trxlog, httpOptions)
    .pipe(
      map(response =>{
        return response;
      })
    );
  }
  
  countByRut(rut : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/ctrcelular/'+rut+'/count', httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  
  findByRut(rut : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/ctrcelular/'+rut, httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  
  
  findFlota(page : number, pageSize : number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    let skip = 0;
    if (page > 0) {
      skip = pageSize * page;
}
    let filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["FECHAREG  DESC"]}';
    return this.http
      .get<any>(
        this.apiUrl + '/flotaveh?filter=' + encodeURIComponent(filter),
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  
  findFlotaAll() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    let filter = '{ "order" : ["FECHAREG DESC"]}';
    return this.http
      .get<any>(
        this.apiUrl + '/flotaveh?filter=' + encodeURIComponent(filter),
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  countFlota() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/flotaveh/count', httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  
  countByRutFlota(rut : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/flotaveh/'+rut+'/count', httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  
  findByRutFlota(rut : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/flotaveh/'+rut, httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  findByPatenteKilometrajeVeh(patente : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/kilometrajeVeh/'+patente, httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  
  findNb(page : number, pageSize : number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    let skip = 0;
    if (page > 0) {
      skip = pageSize * page;
    }
    let filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["FECHAREG  DESC"]}';
    return this.http
      .get<any>(
        this.apiUrl + '/ctrnotebook?filter=' + encodeURIComponent(filter),
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  
  findAllNb() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    let filter = '{ "order" : ["FECHAREG DESC"]}';
    return this.http
      .get<any>(
        this.apiUrl + '/ctrnotebook?filter=' + encodeURIComponent(filter),
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  countNb() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/ctrnotebook/count', httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  
  countByRutNb(rut : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/ctrnotebook/'+rut+'/count', httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  
  findByRutNb(rut : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/ctrnotebook/'+rut, httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }


 findMd(page : number, pageSize : number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    let skip = 0;
    if (page > 0) {
      skip = pageSize * page;
    }
    let filter = '{ "skip": "' + skip +'", "limit": "' + ConstantService.paginationDesktop + '", "order" : ["FECHAREG  DESC"]}';
    return this.http
      .get<any>(
        this.apiUrl + '/ctrmedidor?filter=' + encodeURIComponent(filter),
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  
  findAllMd() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    let filter = '{ "order" : ["FECHAREG DESC"]}';
    return this.http
      .get<any>(
        this.apiUrl + '/ctrmedidor?filter=' + encodeURIComponent(filter),
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  countMd() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/ctrmedidor/count', httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  
  countByRutMd(rut : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/ctrmedidor/'+rut+'/count', httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
  
  findByRutMd(rut : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get<any>(
        this.apiUrl + '/ctrmedidor/'+rut, httpOptions)
      .pipe(
        map(response => {
          return response;
        })
      );
  }
}
