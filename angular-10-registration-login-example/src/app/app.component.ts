import { Component } from '@angular/core';

import { AccountService } from './_services';
import { User } from './_models';
import {first} from "rxjs/operators";

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {
    user: User;

    constructor(private accountService: AccountService) {
        this.accountService.user.subscribe(x => this.user = x);
    }

    logout() {
        console.log('USER APP LOGOUT ', this.user);
        this.accountService.logout()
          .pipe(first())
          .subscribe(
            data => {
              console.log('Logout success ', data);
            },
            error => {
              console.log('Logout error ', error);
            });
    }
}
