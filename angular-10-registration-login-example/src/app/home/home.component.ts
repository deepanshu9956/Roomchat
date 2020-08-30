import {Component, OnInit} from '@angular/core';

import { User } from '@app/_models';
import {AccountService, AlertService} from '@app/_services';
import {FormBuilder} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs/operators";

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
  user: User;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
  ) {
    this.user = this.accountService.userValue;
  }

  ngOnInit() {
    this.accountService.validate(this.accountService.userValue.token)
      .pipe(first())
      .subscribe(
        data => {
          console.log('Validate success ', data);
          // tslint:disable-next-line:variable-name
          const _this = this;
          // tslint:disable-next-line:only-arrow-functions typedef
          const intervalId = setInterval(async function() {
            try {
              const refreshData = await _this.makeRefresh();
              console.log('Refresh success ', refreshData);
            } catch (err) {
              console.log('Refresh error ', err);
              _this.accountService.deleteLocalUser();
              clearInterval(intervalId);
            }
          }, 20000);
        },
        error => {
          console.log('Validate error ', error);
          this.accountService.deleteLocalUser();
        });
  }

  // tslint:disable-next-line:typedef
  async makeRefresh() {
    return new Promise((resolve, reject) => {
      this.accountService.refresh( this.accountService.userValue.token, 500)
        .pipe(first())
        .subscribe(
          data => {
            resolve(data);
          },
          error => {
            reject(error);
          });
    });
  }
}
