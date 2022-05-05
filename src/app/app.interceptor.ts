import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { UtilService } from './shared/services//util.service';
import { map, catchError, } from 'rxjs/operators';
import { ConstantService } from './shared/services/constant.service';
import { SessionService } from './shared/services/session.service';


@Injectable()
export class AppInterceptor implements HttpInterceptor {
    constructor( private utilService: UtilService, private sessionService : SessionService) {}
  
    intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.utilService.showProgressBar(true);
        var reqToken : HttpRequest<any>;
        if (localStorage.getItem("profile")){
          var obj = JSON.parse(localStorage.getItem("profile"));
          if (obj.token){
            reqToken = req.clone({ headers: req.headers.set('Authorization', `Bearer ${obj.token}`)});
          } else {
            reqToken = req.clone();
          }
        } else {
          reqToken = req.clone();
        }
        return next.handle(reqToken).pipe(
          map((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse){
              this.utilService.showProgressBar(false);  
            }            
            return event;
          }), catchError((err: HttpErrorResponse) => {
                let message = "";
                if (err.statusText == ConstantService.UnknownError){
                  message = "Servicio no disponible: " + err.message;
                  console.log(message)
                  this.utilService.showProgressBar(false);
                  return throwError(null)
                }
                else if (err.error && err.error.data && err.error.data.message){
                  message = "Error de servicio:" + err.error.data.message + " (isValid: " + err.error.data.isValid + ")";
                  console.log(message)
                  this.utilService.showProgressBar(false);
                  return throwError(err.error)
                }
                else if (err.error && err.error.data && err.error.isValid != undefined ){
                  message = "Error de servicio: " + err.statusText + " (isValid: " + err.error.isValid + ")";
                  console.log(message)
                  this.utilService.showProgressBar(false);
                  return throwError(err.error)
                } else {
                  this.utilService.showProgressBar(false);
                  return throwError(err)
                }
              })
          );
    } 
}