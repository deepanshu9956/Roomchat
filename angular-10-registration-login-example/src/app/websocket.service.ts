import { Injectable } from '@angular/core';
// @ts-ignore
import * as io from 'socket.io-client';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socket: any;
  readonly uri: string = 'ws://127.0.0.1:3000';

  constructor() {}

  // tslint:disable-next-line:typedef
  connection(token) {
    this.socket = io.connect(this.uri, {
      query: {
        token
      }
    });
    this.socket.on('connect', () => {
      console.log('Client socket connect ', this.socket);
    });
    this.socket.on('disconnect', () => {
      console.log('Client socket disconnect ');
    });
  }
  // tslint:disable-next-line:typedef
  disconnection() {
    this.socket.close();
    this.socket.destroy();
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
