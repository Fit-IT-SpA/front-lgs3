import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AbstractHttpService } from '../../../../../shared/services/abstract-http.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService extends AbstractHttpService
{
    // Private
    private _notifications: BehaviorSubject<Notification[] | null>;

    /**
     * Constructor
     *
     * @param {HttpClient} http
     */
    constructor(protected http: HttpClient) {
        // Set the private defaults
        super(http);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    getWebByEmail(email: string) {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json'
            })
          };
          return this.http
            .get<any>(
              this.apiUrl + '/notification/web/email/'+email, httpOptions)
            .pipe(
              map(response => {
                return response;
              })
        );
    }

    /**
     * Update the notification
     *
     * @param notification
     */
    update(notification: any) {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json'
            })
          };
          return this.http
            .put<any>(
              this.apiUrl + '/notification/update', notification, httpOptions)
            .pipe(
              map(response => {
                return response;
              })
        );
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(rut: string) {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json'
            })
          };
          return this.http
            .put<any>(
              this.apiUrl + '/notifications/readall/web/'+rut, httpOptions)
            .pipe(
              map(response => {
                return response;
              })
        );
    }
}
