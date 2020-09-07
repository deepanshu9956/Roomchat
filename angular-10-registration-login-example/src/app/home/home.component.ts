import {Component, OnInit} from '@angular/core';

import { User, Message } from '@app/_models';
import {AccountService, AlertService} from '@app/_services';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {WebsocketService} from '../websocket.service';
import {range} from 'rxjs';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
  user: User;
  messages: Message[];
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private webSocketService: WebsocketService
  ) {
    this.user = this.accountService.userValue;
    this.webSocketService.connection(this.user.token);
    this.messages = [];
    this.accountService.getAllMessages()
      .pipe(first())
      .subscribe(
        data => {
          console.log(data);
          // data = JSON.parse(data);
          // tslint:disable-next-line:forin
          for (const i in data.message) {
            this.messages = this.messages.concat(JSON.parse(data.message[i]));
          }
        },
        error => {
          console.log('Get All Messages error ', error);
        });
  }

  ngOnInit() {
    this.accountService.validate(this.accountService.userValue.token)
      .pipe(first())
      .subscribe(
        data => {
          console.log('Validate success ', data);

          // tslint:disable-next-line:no-shadowed-variable
          // @ts-ignore
          // const _this = this;
          this.webSocketService.listen('single_message').subscribe((data) => {
            // @ts-ignore
            const result = JSON.parse(data);
            if (!result.error) {
              if (data) {
                this.messages = this.messages.concat({
                  username: result.username,
                  message: result.message
                });
                console.log('Message received ', data);
              }
            }
          });

          // tslint:disable-next-line:variable-name
          const _this = this;
          // tslint:disable-next-line:only-arrow-functions typedef
          const intervalId = setInterval(async function() {
            try {
              const refreshData = await _this.makeRefresh();
              _this.user = _this.accountService.userValue;
              console.log('Refresh success ', refreshData);
              _this.socketUpdateToken();
            } catch (err) {
              console.log('Refresh error ', err);
              _this.accountService.deleteLocalUser();
              clearInterval(intervalId);
            }
          }, 200000);
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

  // tslint:disable-next-line:typedef
  socketUpdateToken() {
    this.webSocketService.socket.query = this.user.token;
  }
  // tslint:disable-next-line:typedef
  sendMessage(inputValue) {
    this.webSocketService.emit('sender_message', inputValue);
  }
}
