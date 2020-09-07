import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {first, map} from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User, Message } from '@app/_models';
import {WebsocketService} from "@app/websocket.service";

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    constructor(
        private router: Router,
        private http: HttpClient,
        private webSocketService: WebsocketService
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(email, password, ttl) {
        return this.http.post<any>(`${environment.apiUrl}/chat/login`, { email, password, ttl })
            .pipe(map(data => {
              const localUser: User = {
                username: data.message.username,
                token: data.message.accessToken,
              };
              // store user details and jwt token in local storage to keep user logged in between page refreshes
              localStorage.setItem('user', JSON.stringify(localUser));
              this.userSubject.next(localUser);
              return localUser;
            }));
    }

    getAllMessages() {
      const token = this.userSubject.value.token;
      return this.http.post<any>(`${environment.apiUrl}/chat/get_all_messages`, {token})
        .pipe(map(data => {
          // remove user from local storage and set current user to null
          return data;
        }));
    }

    logout() {
      const token = this.userSubject.value.token;
      return this.http.post<User>(`${environment.apiUrl}/chat/logout`, {token})
        .pipe(map(data => {
          // remove user from local storage and set current user to null
          localStorage.removeItem('user');
          this.userSubject.next(null);
          this.webSocketService.disconnection();
          this.router.navigate(['/account/login']);
          return data;
        }));
    }

    register(user: User) {
        return this.http.post(`${environment.apiUrl}/chat/register`, user);
    }

    refresh(token, ttl) {
      return this.http.post<any>(`${environment.apiUrl}/chat/refresh`, {token, ttl})
        .pipe(map(user => {
          const localUser: User = {
            username: user.message.username,
            token: user.message.accessToken,
          };
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('user', JSON.stringify(localUser));
          this.userSubject.next(localUser);
          return localUser;
        }));
    }

    validate(token) {
      return this.http.post<any>(`${environment.apiUrl}/chat/validate`, {token})
        .pipe(map(validResp => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          return validResp;
        }));
    }

    deleteLocalUser() {
      localStorage.removeItem('user');
      this.userSubject.next(null);
      this.router.navigate(['/account/login']);
    }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    getById(id: string) {
        return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
    }
}
