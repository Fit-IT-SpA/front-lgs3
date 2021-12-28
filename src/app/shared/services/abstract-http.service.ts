import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbstractHttpService {
  // public apiUrl = 'http://localhost:3000';
  // use relative for releases
  public apiUrl = environment.serverUrl;
  constructor(protected http: HttpClient) {}
}