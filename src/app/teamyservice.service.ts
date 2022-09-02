import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class TeamyserviceService {
  username: any = null;
  totalUsers: any = [];
  url: string = environment.serverUrl;
  dataObservable$: Subject<any>;
  friendList: any = [];

  constructor(private http: HttpClient) {
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

  createUser(userData) {
    // console.log(userData);
    return this.http.post<any>(`${this.url}/createUser`, userData);
  }
  loginUser(userData) {
    return this.http.post<any>(`${this.url}/login`, userData);
  }

  addFriendsToDb(obj) {
    return this.http.post<any>(`${this.url}/addFriend`, obj);
  }

  getFriendsList(username) {
    return this.http.get<any>(`${this.url}/getFriendList/${username}`);
  }
}
