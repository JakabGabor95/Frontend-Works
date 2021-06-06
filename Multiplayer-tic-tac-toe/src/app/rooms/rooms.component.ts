import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../service/firebase.service';
import { AngularFireModule } from '@angular/fire';
import { MapSizeService } from '../service/map-size.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  //Signed in username
  currentUserName:string;

  //Password Input
  passwordInput:string = '';

  //Current room
  currentRoomName:any;
  currentRoom:any;

  //Correct password /connection to a room
  correctPassword:boolean = false;

  //Error messages
  passwordError:boolean = false;

  //unSubscribe variables
  getRoomSubcribe:any;

  currentUserObject: any;
  isSignedIn: boolean = false;

  roomFormValues: FormGroup;
  roomLock: boolean = true;
  roomUnlock: boolean = false;
  showMakeRoomForm: boolean = false;
  roomObject: any;

  roomArray = [];
  //join btn visibility for each custom room, true or false values 
  joinBtnsVisibility:Array<boolean> = [];

  //number of players in each default room
  playersInRoomOne:number = 0;
  roomOneBtnIsInactive:boolean = false;

  playersInRoomTwo:number = 0;
  roomTwoBtnIsInactive:boolean = false;

  playersInRoomThree:number = 0;
  roomThreeBtnIsInactive:boolean = false;




  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private mapSizeService: MapSizeService,
    private firestore : AngularFirestore,
    private db: AngularFireModule) {
    this.roomFormValues = new FormGroup({

      roomName: new FormControl("", Validators.required),
      boardSize: new FormControl("", Validators.required),
      private: new FormControl("", Validators.required),
      password: new FormControl(""),
    })

    //check local storage if the site was reloaded 
    if(localStorage.getItem('roomId') && localStorage.getItem('reload')){
      //send false value to navbar = leave room is invisible
      this.mapSizeService.inTheGame.next(false);

      const roomId = localStorage.getItem('roomId');
      const defaultUser = {
        username: "",
        symbol: "",
        inTheRoom: false,
        leftTheGame: false,
        ready: false,
        readyForNewGame: false,
      }
      //change detectedReload status, to alert the other user that I lost connection to the game
      this.firestore.collection('defaultRooms').doc(roomId).set({'detectedReload': true},{merge: true})

      //reset first users settings
      this.firestore.collection('defaultRooms').doc(roomId).set({'firstPlayer': defaultUser}, {merge: true})
      .then(() => {
        //reset second users settings
        this.firestore.collection('defaultRooms').doc(roomId).set({'secondPlayer': defaultUser}, {merge: true})
        .then(() =>{
          localStorage.removeItem('roomId');
          localStorage.removeItem('reload');
        })
        .catch(err => console.log())
      })
      .catch(err => console.log(err))
      
    }




    //get the number of players in each default room

    this.firestore.collection('defaultRooms').valueChanges().subscribe(
      (data) => {
        data.forEach((room:any) => {            
              if(room.roomName === 'default1'){
                //if only the firstplayer is in the room
                if(room.firstPlayer.inTheRoom){
                  this.playersInRoomOne = 1
                  this.roomOneBtnIsInactive = false;
                  //if only the secondplayer is in the room
                } else if(room.secondPlayer.inTheRoom){
                  this.playersInRoomOne = 1;
                  this.roomOneBtnIsInactive = false;
                }
                //if both if them are in the room
                if(room.firstPlayer.inTheRoom && room.secondPlayer.inTheRoom){
                  this.playersInRoomOne = 2;
                  //if the room is full, set the btn to inactive
                  this.roomOneBtnIsInactive = true;
                }

                //if the room is empty set the btn to active
                if(!room.firstPlayer.inTheRoom && !room.secondPlayer.inTheRoom){
                  this.playersInRoomOne = 0;
                  this.roomOneBtnIsInactive = false;
                }
              }
              
              if(room.roomName === 'default2'){
                //if only the firstplayer is in the room
                if(room.firstPlayer.inTheRoom){
                  this.playersInRoomTwo = 1
                  this.roomTwoBtnIsInactive = false;
                  //if only the secondplayer is in the room
                } else if(room.secondPlayer.inTheRoom){
                  this.playersInRoomTwo = 1;
                  this.roomTwoBtnIsInactive = false;
                }
                //if both if them are in the room
                if(room.firstPlayer.inTheRoom && room.secondPlayer.inTheRoom){
                  this.playersInRoomTwo = 2;
                  //if the room is full, set the btn to inactive
                  this.roomTwoBtnIsInactive = true;
                }

                //if the room is empty set the btn to active
                if(!room.firstPlayer.inTheRoom && !room.secondPlayer.inTheRoom){
                  this.playersInRoomTwo = 0;
                  this.roomTwoBtnIsInactive = false;
                }
              }


              if(room.roomName === 'default3'){
                //if only the firstplayer is in the room
                if(room.firstPlayer.inTheRoom){
                  this.playersInRoomThree = 1
                  this.roomThreeBtnIsInactive = false;
                  //if only the secondplayer is in the room
                } else if(room.secondPlayer.inTheRoom){
                  this.playersInRoomThree = 1;
                  this.roomThreeBtnIsInactive = false;
                }
                //if both if them are in the room
                if(room.firstPlayer.inTheRoom && room.secondPlayer.inTheRoom){
                  this.playersInRoomThree = 2;
                  //if the room is full, set the btn to inactive
                  this.roomThreeBtnIsInactive = true;
                }

                //if the room is empty set the btn to active
                if(!room.firstPlayer.inTheRoom && !room.secondPlayer.inTheRoom){
                  this.playersInRoomThree = 0;
                  this.roomThreeBtnIsInactive = false;
                }
              }

              this.firestore.collection('defaultRooms').get().subscribe(
                (rooms) => {
                  this.roomArray = [];
                  rooms.forEach((room:any) => {
                    if(room.data().type === 'custom'){
                      this.roomArray.push(room.data());
                    }
                  })
                },
                (err) => {console.log(err)},
                () => {}
              );
        })
      },
      (err) => {console.log(err)},
      () => {}
    );



  }
  ngOnInit(): void {
    

    if(localStorage.getItem('user')){
      this.handleGetCurrentUser();
      this.handleGetRooms();
      this.isSignedIn = true;
    } else {
      this.isSignedIn = false;
    }
  }


 
  

  //HANDLE GET CURRENT USER
  handleGetCurrentUser() {
    
    this.firebaseService.getCurrentUser().subscribe(
      (users) => {
        users.forEach((user: any) => {
          this.currentUserObject = user.data();
          this.currentUserName = user.data().username;
          this.isSignedIn = true;
        })
      }
    );
  }

  //DISPLAY ROOM FORM
  makeNewRoomForm() {
    this.showMakeRoomForm = true;
  }

  //CREATE NEW ROOM
  makeRoom() {
    this.showMakeRoomForm = false;
    this.roomObject = this.roomFormValues.value;

    let isPrivate:boolean;
    if (this.roomObject.private === 'yes') {
      isPrivate = true
    } else {
      isPrivate = false
    }

    /* let roomToDatabase = {
      roomName: this.roomObject.roomName,
      boardSize: this.roomObject.boardSize,
      players: 1,
      private: isPrivate,
      password: this.roomObject.password,
      host: this.currentUserObject.username, 
      numberOfPlayers: this.roomObject.numberOfPlayers,
      type: 'custom'
    } */
    let roomToDatabase = {
      detectedReload : false,
      draw : false,
      fieldOfFirstPlayer : [],
      fieldOfSecondPlayer : [],
      firstPlayer : {
        inTheRoom : false,
        leftTheGame: false,
        ready: false,
        readyForNewGame: false,
        symbol: "",
        username: "",
      },
      secondPlayer : {
        inTheRoom : false,
        leftTheGame: false,
        ready: false,
        readyForNewGame: false,
        symbol: "",
        username: "",
      },
      firstPlayerIsTheWinner: false,
      firstPlayerTurn: true,
      playerSwitch: false,
      secondPlayerIsTheWinner: false,
      secondPlayerTurn: false,
      type: 'custom',
      
      //custom settings
      roomName: this.roomObject.roomName,
      boardSize: this.roomObject.boardSize,
      host: this.currentUserObject.username, 
      private: isPrivate,
      password: this.roomObject.password,
      playersInTheRoom: 0,
    }

    this.firebaseService.addNewRoom(roomToDatabase)
    .then(() => this.handleGetRooms())
    .catch((err) => console.log(err)) 
  }

  //HANDLE GET ROOMS
  //lekért szobák szépen megjelennek a táblázatban az adatokkal
  handleGetRooms() {
    this.roomArray = [];
    this.getRoomSubcribe = this.firebaseService.getRooms().subscribe(
      (rooms) => {
   
         rooms.forEach((room: any) => {
           if(room.data().type === 'custom'){
             this.roomArray.push(room.data());
           }
        })
      },
      (err) => {console.log(err)}
      
      ) 
      

    
  }


//JOIN TO GAME
//ha kell jelszó, addig a gomb disabled
  joinToGame(room){
    let roomData:any = {};

    if(typeof room === "string"){
    
      if(room === 'small'){
        roomData = {
          //roomName: "Small Board",
          roomName: "default1",
          boardSize: "small"
        }
      }
      if(room === 'medium'){
        roomData = {
          //roomName: "Medium Board",
          roomName: "default2",
          boardSize: "medium"
        }
      }
      if(room == "large"){
        roomData = {
          //roomName: "Large Board",
          roomName: "default3",
          boardSize: "large"
        }
      }
    }
    
    else {
      roomData = room;
    }

   this.mapSizeService.loggedInUser.next(this.currentUserObject);
   this.mapSizeService.roomData.next(roomData);
   this.router.navigate(['/waitingroom']);  
  }

  getActualRoom(room) {
    this.currentRoomName = room.roomName
    this.currentRoom = room;
  }

  checkCorrectPassword() {
     this.firebaseService.getCurrentRoom(this.currentRoomName).subscribe(
       (room) => {
        room.forEach((roomObj: any) => {
          if(this.passwordInput === roomObj.data().password) {
            this.joinToGame(this.currentRoom);
            const modal = (document.getElementById('passwordModal') as HTMLElement)
            
            modal.click();
            
          }else {
            
            this.passwordError = true;
          }
        })
       },
       () => {}
     )
  }


  resetDatabase(){
    const defaultSettings = {
      username : "",
      symbol : "",
      ready: false,
      inTheRoom: false
    }

    localStorage.removeItem('username');

    this.firestore.collection('defaultRooms').get().subscribe(
      (rooms:any) => {
        rooms.forEach((room:any) => {
          this.firestore.collection('defaultRooms').doc(room.id).set({'firstPlayer': defaultSettings}, {merge: true})
          this.firestore.collection('defaultRooms').doc(room.id).set({'secondPlayer': defaultSettings}, {merge: true})
          .then(() => {location.reload()})
        })
      },
      (err) => {console.log(err)},
      () => {}
    );

  }

 
}