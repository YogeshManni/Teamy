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
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  username: any = null;
  cUser: string = '';
  isMobile;
  random: number = 0;
  totalUsers: any = [];
  userId: any = null;
  isCollapsed: boolean = false;
  usernameModal: boolean = false;
  constructor(
    private _service: TeamyserviceService,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService
  ) {}
  ngOnInit(): void {
    this.isCollapsed = window.innerWidth < 600 ? true : false;
    this.usernameModal = true;
  }

  createMessage(msg: string): void {
    this.message.error(msg);
  }

  handlePromptOk() {
    let ifnotempty = this.cUser.replace(/\s/g, '').length;
    if (this.cUser == '' || !ifnotempty) {
      this.createMessage('Please type a username to continue');
      return;
    }
    this.username = this.cUser;

    this._service.setUsername(this.username);
    this.random = Math.floor(Math.random() * 100 + 1);
    this.usernameModal = false;
    this._service.getTotalUsers().subscribe({
      next: (res) => {
        this.totalUsers = Object.values(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  handlePromptCancel() {}
  callUser(usedId) {
    this.userId = usedId;
    setTimeout(() => {
      this.userId = null;
    }, 2000);
  }
}
