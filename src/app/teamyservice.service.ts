import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class TeamyserviceService {
  username: string = '';
  totalUsers: any = [];

  dataObservable$: Subject<any>;

  constructor() {
    this.dataObservable$ = new Subject();
  }

  setUsername(user) {
    this.username = user;
  }
  getUsername() {
    return this.username;
  }

  //event listner....
  getTotalUsers() {
    return this.dataObservable$.asObservable();
  }
  //event emitter....
  setTotalUsers(users) {
    this.dataObservable$.next(users);
  }
}
