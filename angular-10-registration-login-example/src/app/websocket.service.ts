import { Injectable } from '@angular/core';
// @ts-ignore
import * as io from 'socket.io-client';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socket: any;
  readonly uri: string = 'ws://localhost:3000';

  constructor() {
    this.socket = io(this.uri);
  }

  // tslint:disable-next-line:typedef
  connection() {
    console.log('Dont know');
    this.socket.on('connection', () => {
      console.log('Client socket');
    });
  }
  // tslint:disable-next-line:typedef
  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  }

  // tslint:disable-next-line:typedef
  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
