import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { AuthUtils } from '../../core/auth/auth.utils';
import { EndpointService } from "../services/endpoint.service";
import { Router } from '@angular/router';
import { AbstractHttpService } from '../services/abstract-http.service';

@Injectable()
export class AuthServiceNielsen extends AbstractHttpService
{
    // Private
    private _authenticated: boolean;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(private _httpClient: HttpClient, private route: Router)
    {
        // Set the defaults
        super(_httpClient);
        this._authenticated = false;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('access_token', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('access_token');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string, password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }
        return this._httpClient.post<any>(this.apiUrl + EndpointService.Auth_Authenticate, credentials,)
        .pipe(map( response => { 
            localStorage.setItem('profile', JSON.stringify(response));
            return of(response);
          })
        );
    }
    register(credentials: { email: string, name: string, lastName: string, typeUser: string, password: string, billingType: string, rut: string }): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json'
            })
          };
        return this._httpClient.post<any>(this.apiUrl + EndpointService.Account_Regist, credentials, httpOptions)
        .pipe(map( response => { 
            return response;
          })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // Renew token
        return this._httpClient.post('mock/auth/refresh-access-token', {
            access_token: this.accessToken
        }).pipe(
            catchError(() => {

                // Return false
                return of(false);
            }),
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.access_token;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut()
    {
        // Remove the access token from the local storage
        localStorage.removeItem('access_token');
        this._authenticated = false;
        this.route.navigate(['sign-in']);
    }

    logout(rut: string, type: string) {
        return this.http
        .put<boolean>(`${this.apiUrl}/audit-authentications/log-out/${rut}/${type}`,{})
        .pipe(
            map((response) => {
            return response;
            })
        );
    }

    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
