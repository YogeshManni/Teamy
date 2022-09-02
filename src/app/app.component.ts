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
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

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
  validateForm: FormGroup;
  passwordVisible: boolean = false;
  registerModalVisible: boolean = false;
  registerForm: FormGroup;
  loginMessage: string = '';
  isAuthenciated: boolean = false;
  notfriend: boolean = false;
  isGuest: boolean = false;
  friendList: any = [];
  constructor(
    private _service: TeamyserviceService,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.isCollapsed = window.innerWidth < 600 ? true : false;
    this.usernameModal = true;

    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      /*  remember: [true], */
    });

    this.registerForm = this.fb.group({
      email: [null, [Validators.email, Validators.required]],
      password: [null, [Validators.required]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]],
      nickname: [null, [Validators.required]],
      phoneNumber: [null],
    });
  }

  getFriendsList() {
    this._service.getFriendsList(this.username).subscribe({
      next: (res) => {
        let friends = Array.from(new Set(res.friends));
        this.friendList = friends;
        this._service.friendList = friends;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.registerForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() =>
      this.registerForm.controls['checkPassword'].updateValueAndValidity()
    );
  }
  createMessage(msg: string): void {
    this.message.error(msg);
  }

  openRegisterModal() {
    this.usernameModal = false;
    this.registerModalVisible = true;
  }

  openLoginModal() {
    this.usernameModal = true;
    this.registerModalVisible = false;
  }
  handlePromptOk() {
    let ifnotempty = this.cUser.replace(/\s/g, '').length;
    if (this.cUser == '' || !ifnotempty) {
      this.createMessage('Please type a username to continue');
      return;
    }
    this.username = this.cUser;
    this.isGuest = true;
    this.isAuthenciated = true;
    this._service.setUsername({ username: this.username, isGuest: true });
    this.random = Math.floor(Math.random() * 100 + 1);
    this.usernameModal = false;
    this.getAllUsers();
  }

  getAllUsers() {
    this._service.getTotalUsers().subscribe({
      next: (res) => {
        this.totalUsers = Object.values(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  submitForm() {
    if (this.validateForm.valid) {
      let userData = this.validateForm.value;
      this._service.loginUser(userData).subscribe({
        next: (res) => {
          this.isAuthenciated = true;
          this.message.success(res.message);
          this.username = res.userName;
          this.isGuest = false;
          this._service.setUsername({ username: res.userName, isGuest: false });
          this.getFriendsList();
          this.getAllUsers();
          this.usernameModal = false;
        },
        error: (err) => {
          this.message.error(err.error.message, {
            nzDuration: 5000,
          });
        },
      });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  callUser(usedId) {
    this.userId = usedId;
    setTimeout(() => {
      this.userId = null;
    }, 2000);
  }

  registerFormSubmit() {
    if (this.registerForm.valid) {
      let userData = this.registerForm.value;
      this._service.createUser(userData).subscribe({
        next: (res) => {
          console.log(res);
          this.message.success(res.message);
          this.openLoginModal();
        },
        error: (err) => {
          console.log(err);
          this.message.error(err.error.message);
        },
      });
    } else {
      Object.values(this.registerForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  getUserToCall(user) {
    this.totalUsers.forEach((item) => {
      if (item[1] == user) {
        this.callUser(item);
        return;
      }
    });
  }

  isUserOnline(friend) {
    for (let friends of this.totalUsers) {
      if (friends[1] == friend) {
        return true;
      }
    }
    return false;
  }
}
