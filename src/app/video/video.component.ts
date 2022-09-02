import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { TeamyserviceService } from '../teamyservice.service';
import { windowWhen } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css'],
})
export class VideoComponent implements OnInit {
  @ViewChild('friendVideoPlayer')
  friendVideoPlayer!: ElementRef;

  @ViewChild('selfVideoPlayer')
  selfVideoPlayer!: ElementRef;

  socket: any;
  selfId: any = '';
  selfStream: any = null;
  selfFriends: any = [];
  callerName: string = '';
  recievingcall: boolean = false;
  callerData: any = null;
  callerSignal: any = null;
  allUsers: any;
  userName: string = '';
  callAccepted: boolean = false;
  isVisible: boolean = false;
  friendName: string = '';
  isCalling: boolean = false;
  inCall: boolean = false;
  isMobile: boolean = false;
  friendId: string = '';
  isGuest: boolean = false;
  peer: any = null;
  constructor(private _service: TeamyserviceService) {}

  @Input()
  set callerUserID(userData: string) {
    if (userData != null) {
      this.isVisible = true;
      this.friendName = userData[1];
      this.friendId = userData[0];

      this.isCalling = true;
      this.callPeer(userData[0]);
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }
  playVideo() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        //  console.log('stream');
        this.selfStream = stream;
        if (this.selfVideoPlayer) {
          this.selfVideoPlayer.nativeElement.srcObject = stream;
          this.selfVideoPlayer.nativeElement.play();
        }
      })
      .catch((err) => {
        console.error('error:', err);
      });
  }

  resetDimensions() {
    let vd = document.getElementsByClassName('friendVideo')[0];
    vd.setAttribute('height', String(window.outerHeight));
    vd.setAttribute('width', String(window.outerWidth));
  }
  ngOnInit(): void {
    this.isMobile = window.innerWidth < 600 ? true : false;
    this.resetDimensions();

    let user = this._service.getUsername();

    this.isGuest = user.isGuest;
    this.userName = user.username;
    // // 'http://localhost:5000/'
    this.socket = io(environment.serverUrl, {
      transports: ['websocket'],
    });

    this.playVideo();

    this.socket.emit('userName', user);
    this.socket.emit('getFriends', {
      userName: this.userName,
      from: this.selfId,
    });

    this.socket.on('friends', (data) => {
      console.log(data.friends);
      this.selfFriends = data.friends;
    });

    this.socket.on('yourID', (id) => {
      this.selfId = id;
    });

    this.socket.on('callRejected', (data) => {
      this.friendVideoPlayer.nativeElement.srcObject = null;
      this.inCall = false;
      this.resetDimensions();
      this.isVisible = false;
      this.peer.destroy();
    });
    this.socket.on('allUsers', (users) => {
      this.allUsers = users;
      this._service.setTotalUsers(this.allUsers);
      //@setValfn(users)
    });

    this.socket.on('hey', (data) => {
      this.callerName = this.friendName = data.callerName;
      this.recievingcall = false;
      this.callerData = data.from;
      this.callerSignal = data.signal;
      this.isCalling = false;
      this.setVideoDimensions(data.callerHeight, data.callerWidth);

      this.isVisible = true;
    });
    this.socket.on('error', (res) => {
      //console.log(res);
    });
  }

  setVideoDimensions(friendsHeight, friendsWidth) {
    let selfHeight = window.innerHeight;
    let selfWidth = window.innerWidth;
    if (selfHeight < friendsHeight) friendsHeight = selfHeight;
    if (selfWidth < friendsWidth) friendsWidth = selfWidth;
    this.friendVideoPlayer.nativeElement.width = friendsWidth;
    this.friendVideoPlayer.nativeElement.height = friendsHeight;
  }

  callPeer(id) {
    this.peer = new Peer({
      initiator: true,
      trickle: false,
      config: {},
      stream: this.selfStream,
    });

    this.recievingcall = true;

    this.peer.on('signal', (data) => {
      this.socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: this.selfId,
        friendName: this.userName,
        callerName: this.userName,
        selfWidth: window.innerWidth,
        selfHeight: window.innerHeight,
      });
    });

    this.peer.on('stream', (stream) => {
      if (this.friendVideoPlayer) {
        this.friendVideoPlayer.nativeElement.srcObject = stream;
      }
    });

    this.socket.on('callAcceptedUser', (signal, width, height) => {
      this.inCall = true;
      this.isVisible = false;
      this.callAccepted = true;
      this.setVideoDimensions(height, width);
      this.addFriendsToDb();
      this.peer.signal(signal);
    });
  }

  checkIfUserIsGuest(user) {
    let users: any = Object.values(this.allUsers);
    for (let item of users) {
      if (item[1] == user) {
        return item[2];
      }
    }
    return true;
  }
  addFriendsToDb() {
    if (
      !this._service.friendList.includes(this.friendName) &&
      !this.isGuest &&
      !this.checkIfUserIsGuest(this.friendName)
    ) {
      this._service
        .addFriendsToDb({
          friendName: this.friendName,
          selfName: this.userName,
        })
        .subscribe({
          next: (res) => {
            console.log(res);
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  rejectCall() {
    this.isVisible = false;
    this.inCall = false;
    this.resetDimensions();
    if (this.friendVideoPlayer)
      this.friendVideoPlayer.nativeElement.srcObject = null;

    this.socket.emit('rejectCall', {
      to: this.isCalling ? this.friendId : this.callerData,
      friendName: this.userName,
      acceptorName: this.userName,
    });
    this.peer.destroy();
  }

  acceptCall() {
    this.addFriendsToDb();
    this.callAccepted = true;
    this.inCall = true;
    this.isVisible = false;
    this.peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.selfStream,
    });

    this.peer.on('signal', (data) => {
      this.socket.emit('acceptCall', {
        signal: data,
        to: this.callerData,
        friendName: this.userName,
        acceptorName: this.userName,
        selfWidth: window.innerWidth,
        selfHeight: window.innerHeight,
      });
    });

    this.peer.on('stream', (stream) => {
      if (this.friendVideoPlayer) {
        this.friendVideoPlayer.nativeElement.srcObject = stream;
      }
    });

    this.peer.signal(this.callerSignal);
  }

  /*  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event: any) {
    // this.socket.emit('removeUser', this.userName);
  } */
}
