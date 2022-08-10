import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Output,
  ɵgetUnknownElementStrictMode,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { TeamyserviceService } from './teamyservice.service';
import { RandomNumberPipe } from './random-number.pipe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  username;
  isMobile;
  random: number = 0;
  totalUsers: any = [];
  userId: any = null;
  isCollapsed: boolean = false;

  constructor(
    private _service: TeamyserviceService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.isCollapsed = window.innerWidth < 600 ? true : false;
    this.username = prompt('Type in your Username !!');
    this._service.setUsername(this.username);
    this.random = Math.floor(Math.random() * 100 + 1);
    this._service.getTotalUsers().subscribe({
      next: (res) => {
        this.totalUsers = Object.values(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ngAfterViewInit() {
    //this.cdr.markForCheck();
  }

  callUser(usedId) {
    this.userId = usedId;
    setTimeout(() => {
      this.userId = null;
    }, 2000);
  }
}
