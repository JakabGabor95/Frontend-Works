import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { MapSizeService } from '../service/map-size.service';
import Swal from 'sweetalert2'
import { Subscription } from 'rxjs';




@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  //Boards
  smallBoard: boolean = true;
  mediumBoard: boolean = false;

  //ONLINE
  fieldSmallTiles: any;

  //default fields
  fieldsSmall: any = Array(9).fill(0);
  fieldsMedium: any = Array(25).fill(0);
  fieldsLarge: any = Array(100).fill(0);

  smallTestArray: any = Array(9).fill(0);
  mediumTestArray: any = Array(25).fill(0);
  largeTestArray: any = Array(100).fill(0);


  //placed marker arrays
  fieldsOfFirstPlayer: Array<Array<number>> = [];
  fieldsOfSecondPlayer: Array<Array<number>> = [];

  //First or Second player
  firstPlayerTurn: boolean = false;

  //Player Names
  firstPlayerName: string = '';
  secondPlayerName: string = '';


  // chances Of Winning
  chanceOfWinning: Array<any> = [];

  //who is the winner
  winnerFirstPlayer: boolean = false;
  winnerSecondPlayer: boolean = false;
  gameIsOver: boolean = false;

  //Winner Medium Board
  winnerFirstPlayerMediumBoard: boolean = false;
  winnerSecondPlayerMediumBoard: boolean = false;
  winnerThirdPlayerMediumBoard: boolean = false;

  //Winner Large Board
  winnerFirstPlayerLargeBoard: boolean = false;
  winnerSecondPlayerLargeBoard: boolean = false;

  //winning counter
  firstPlayerWonCounter: number = 0;
  secondPlayerWonCounter: number = 0;

  //other player is ready => show text 
  otherPlayerReady: boolean = false;

  //Players object
  playersObject: any;

  //three player?-------------------------------------------->
  threePlayerGame: boolean = false;
  thirdPlayerName: string = '';
  fieldsOfThirdPlayer: Array<Array<number>> = [];
  winnerThirdPlayer: boolean = false;
  thirdPlayerWonCounter: number = 0;

  //Who is the next player
  whoIsTheNextPlayer: Array<string>;
  indexOfPlayersArray: number = 0;

  //current player
  currentPlayer: string;

  //player turn firebase
  firstPlayerTurnToFirebase: boolean;
  secondPlayerTurnToFirebase: boolean;

  //Test icons
  localTestIcon: string;
  localTestFieldsFirstPlayer: Array<Array<number>> = [];
  localTestFieldsSecondPlayer: Array<Array<number>> = [];

  //basic values of a user
  defaultSettings: any = {
    username: "",
    symbol: "",
    inTheRoom: false,
    ready: false,
    leftTheGame: false,
  }



  // ----------- CHAT -------------
  @ViewChild('chatInputRef') chatInput: ElementRef;
  updatedTextArray: Array<any> = [];
  //boolean for notification visibility
  notificationIsVisible: boolean = false;



  //RELOAD
  @HostListener('window:unload', ['$event'])
  unloadHandler() {
    localStorage.setItem('roomId', this.playersObject.roomId)
    localStorage.setItem('reload', 'true');
  }




  constructor(
    private mapSizeService: MapSizeService,
    private db: AngularFirestore,
    private router: Router
  ) {



    //get game object to show icons, names etc
    const subs = this.mapSizeService.mapSize.subscribe(
      (playerObj) => {
        this.playersObject = playerObj;
        this.firstPlayerName = playerObj.firstPlayerName;
        this.secondPlayerName = playerObj.secondPlayerName;
      },
      (err) => { console.log(err) },
      () => { subs.unsubscribe() }
    );

    //send true value to navbar = leave room is visible
    this.mapSizeService.inTheGame.next(true);

    //check leave game status (leave game btn)
    this.mapSizeService.leftTheGame.subscribe(
      (status: boolean) => {
        if (status) {
          this.leaveGame();
        }
      },
      (err) => { console.log(err) },
    );
  }

  ngOnInit(): void {
    //Location reload detect
    if (localStorage.getItem('reload') == 'true') {


      this.router.navigate(['/rooms']);
    }

    this.mapSizeService.mapSize.subscribe(
      (playersObj) => {
        if (playersObj.map === 'small') {

          let defaultChatText = [{
            player: 'Welcome',
            text: 'Welcome to the Tic Tac Toe Game!'
          }];

          this.db.collection('chat').doc(this.playersObject.roomId).set({ 'texts': defaultChatText }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });

          this.db.collection('defaultRooms').doc(playersObj.roomId).update({ 'smallMap': this.smallTestArray })
          this.db.collection('defaultRooms').doc(playersObj.roomId).get().subscribe(
            (roomDatas: any) => {
              this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'playerSwitch': false }, { merge: true });
              this.fieldsSmall = roomDatas.data().smallMap
              this.createSmallBoard(playersObj);
              this.firstPlayerTurnToFirebase = roomDatas.data().firstPlayerTurn;
              this.secondPlayerTurnToFirebase = roomDatas.data().secondPlayerTurn;



              if (playersObj.firstPlayerName === localStorage.getItem('username') && roomDatas.data().firstPlayerTurn) {
                this.localTestIcon = playersObj.firstPalyerselectedIcon;

                this.setPointerEvents('auto');

              }

              if (playersObj.secondPlayerName === localStorage.getItem('username') && !roomDatas.data().secondPlayerTurn) {
                this.localTestIcon = playersObj.secondPalyerselectedIcon;


                this.setPointerEvents('none');



              }
            },
            (err) => { console.log(err) },
            () => {

              const subscription = this.db.collection('defaultRooms').doc(this.playersObject.roomId).valueChanges().subscribe(
                (roomDatas: any) => {
                  this.fieldsSmall = roomDatas.smallMap
                  this.changeAllFields()




                  if (playersObj.firstPlayerName === localStorage.getItem('username') && roomDatas.firstPlayerTurn) {

                    this.setPointerEvents('auto');
                    this.localTestIcon = playersObj.firstPalyerselectedIcon;
                    this.changeAllFields()



                  }

                  if (playersObj.firstPlayerName === localStorage.getItem('username') && !roomDatas.firstPlayerTurn) {

                    this.setPointerEvents('none');

                    this.localTestIcon = playersObj.secondPalyerselectedIcon;


                  }

                  if (playersObj.secondPlayerName === localStorage.getItem('username') && !roomDatas.secondPlayerTurn) {

                    this.localTestIcon = playersObj.firstPalyerselectedIcon;

                    this.setPointerEvents('none');

                  }


                  if (playersObj.secondPlayerName === localStorage.getItem('username') && roomDatas.secondPlayerTurn) {


                    this.setPointerEvents('auto');
                    this.localTestIcon = playersObj.secondPalyerselectedIcon;
                    this.changeAllFields()
                  }


                  //check each player's ready for new game status, if both of them are true, start a new game
                  let dbFirstPlayer = roomDatas.firstPlayer;
                  let dbSecondPlayer = roomDatas.secondPlayer;
                  //check each player's ready status for new game, to show text that the other player is ready 
                  if (dbFirstPlayer.readyForNewGame && playersObj.secondPlayerName === localStorage.getItem('username')) {
                    this.otherPlayerReady = true;
                    setTimeout(() => {
                      this.otherPlayerReady = false;
                    }, 5000);
                  }

                  if (dbSecondPlayer.readyForNewGame && playersObj.firstPlayerName === localStorage.getItem('username')) {
                    this.otherPlayerReady = true;
                    setTimeout(() => {
                      this.otherPlayerReady = false;
                    }, 5000);
                  }

                  if (dbFirstPlayer.readyForNewGame && dbSecondPlayer.readyForNewGame) {
                    this.otherPlayerReady = false;
                    this.createNewGame();
                    //if new game started, unsubs for other changes
                    //subscription.unsubscribe();
                  }


                  //check if a player leaves the game
                  if (dbFirstPlayer.leftTheGame) {
                    //this.leaveGame();
                    if (playersObj.secondPlayerName === localStorage.getItem('username')) {
                      subscription.unsubscribe();
                      this.openLeftTheGameModal();
                    }
                  }

                  if (dbSecondPlayer.leftTheGame) {
                    //this.leaveGame();
                    if (playersObj.firstPlayerName === localStorage.getItem('username')) {
                      subscription.unsubscribe();
                      this.openLeftTheGameModal();
                    }
                  }

                  //check if a player reloaded the site or lost connection 
                  if (roomDatas.detectedReload) {
                    this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'detectedReload': false }, { merge: true })
                      .then(() => {
                        if (this.playersObject.type === "custom") {
                          this.db.collection('defaultRooms').doc(this.playersObject.roomId).delete();
                        }
                      })
                      .then(() => {
                        Swal.fire({
                          imageUrl: 'https://images.pexels.com/photos/4439425/pexels-photo-4439425.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
                          title: 'Your partner lost connection!',
                          showConfirmButton: true,
                          confirmButtonText: 'Leave room',
                        }).then((res) => {
                          if (res.isConfirmed) {
                            window.location.href = '/rooms';
                          }
                          if (res.isDismissed) {
                            window.location.href = '/rooms';
                          }
                        });
                      })
                      .then(() => {
                        //send false value to navbar = leave room is invisible
                        this.mapSizeService.inTheGame.next(false);
                        //this.router.navigate(['/rooms'])
                      })
                      .catch(err => console.log(err))
                  }

                },
                (err) => { console.log(err) },
                () => { }
              )
            }
          )
        }

        if (playersObj.map === 'medium') {

          let defaultChatText = [{
            player: 'Welcome',
            text: 'Welcome to the Tic Tac Toe Game!'
          }];

          this.db.collection('chat').doc(this.playersObject.roomId).set({ 'texts': defaultChatText }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });

          this.db.collection('defaultRooms').doc(playersObj.roomId).update({ 'mediumMap': this.mediumTestArray })

          this.db.collection('defaultRooms').doc(playersObj.roomId).get().subscribe(
            (roomDatas: any) => {
              this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'playerSwitch': false }, { merge: true });
              this.fieldsMedium = roomDatas.data().mediumMap
              this.createMediumBoard(playersObj);
              this.firstPlayerTurnToFirebase = roomDatas.data().firstPlayerTurn;
              this.secondPlayerTurnToFirebase = roomDatas.data().secondPlayerTurn;

              if (playersObj.firstPlayerName === localStorage.getItem('username') && roomDatas.data().firstPlayerTurn) {
                this.localTestIcon = playersObj.firstPalyerselectedIcon;

                this.setPointerEvents('auto');

              }

              if (playersObj.secondPlayerName === localStorage.getItem('username') && !roomDatas.data().secondPlayerTurn) {
                this.localTestIcon = playersObj.secondPalyerselectedIcon;


                this.setPointerEvents('none');
              }
            },
            (err) => { console.log(err) },
            () => {
              const subscription = this.db.collection('defaultRooms').doc(this.playersObject.roomId).valueChanges().subscribe(
                (roomDatas: any) => {
                  this.fieldsMedium = roomDatas.mediumMap
                  this.changeAllFields()

                  if (playersObj.firstPlayerName === localStorage.getItem('username') && roomDatas.firstPlayerTurn) {

                    this.setPointerEvents('auto');
                    this.localTestIcon = playersObj.firstPalyerselectedIcon;
                    this.changeAllFields()



                  }

                  if (playersObj.firstPlayerName === localStorage.getItem('username') && !roomDatas.firstPlayerTurn) {

                    this.setPointerEvents('none');
                    this.localTestIcon = playersObj.secondPalyerselectedIcon;


                  }

                  if (playersObj.secondPlayerName === localStorage.getItem('username') && !roomDatas.secondPlayerTurn) {

                    this.localTestIcon = playersObj.firstPalyerselectedIcon;

                    this.setPointerEvents('none');

                  }

                  if (playersObj.secondPlayerName === localStorage.getItem('username') && roomDatas.secondPlayerTurn) {


                    this.setPointerEvents('auto');
                    this.localTestIcon = playersObj.secondPalyerselectedIcon;
                    this.changeAllFields()
                  }

                  //check each player's ready for new game status, if both of them are true, start a new game
                  let dbFirstPlayer = roomDatas.firstPlayer;
                  let dbSecondPlayer = roomDatas.secondPlayer;
                  //check each player's ready status for new game, to show text that the other player is ready 
                  if (dbFirstPlayer.readyForNewGame && playersObj.secondPlayerName === localStorage.getItem('username')) {
                    this.otherPlayerReady = true;
                    setTimeout(() => {
                      this.otherPlayerReady = false;
                    }, 5000);
                  }

                  if (dbSecondPlayer.readyForNewGame && playersObj.firstPlayerName === localStorage.getItem('username')) {
                    this.otherPlayerReady = true;
                    setTimeout(() => {
                      this.otherPlayerReady = false;
                    }, 5000);
                  }

                  if (dbFirstPlayer.readyForNewGame && dbSecondPlayer.readyForNewGame) {
                    this.otherPlayerReady = false;
                    this.createNewGame();
                    //if new game started, unsubs for other changes
                    //subscription.unsubscribe();
                  }

                  if (dbFirstPlayer.leftTheGame) {
                    //this.leaveGame();
                    if (playersObj.secondPlayerName === localStorage.getItem('username')) {
                      subscription.unsubscribe();
                      this.openLeftTheGameModal();
                    }

                  }

                  if (dbSecondPlayer.leftTheGame) {
                    //this.leaveGame();
                    //this.openLeftTheGameModal()
                    if (playersObj.firstPlayerName === localStorage.getItem('username')) {
                      subscription.unsubscribe();
                      this.openLeftTheGameModal();
                    }
                  }

                  //check if a player reloaded the site or lost connection 
                  if (roomDatas.detectedReload) {
                    this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'detectedReload': false }, { merge: true })
                      .then(() => {
                        if (this.playersObject.type === "custom") {
                          this.db.collection('defaultRooms').doc(this.playersObject.roomId).delete();
                        }
                      })
                      .then(() => {
                        Swal.fire({
                          imageUrl: 'https://images.pexels.com/photos/4439425/pexels-photo-4439425.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
                          title: 'Your partner lost connection!',
                          showConfirmButton: true,
                          confirmButtonText: 'Leave room',
                        }).then((res) => {
                          if (res.isConfirmed) {
                            window.location.href = '/rooms';
                          }
                          if (res.isDismissed) {
                            window.location.href = '/rooms';
                          }
                        });
                      })
                      .then(() => {
                        //send false value to navbar = leave room is invisible
                        this.mapSizeService.inTheGame.next(false);
                        //this.router.navigate(['/rooms'])
                      })
                      .catch(err => console.log(err))
                  }

                },
                (err) => { console.log(err) },
                () => { }
              )
            }
          )


        }

        if (playersObj.map === 'large') {

          let defaultChatText = [{
            player: 'Welcome',
            text: 'Welcome to the Tic Tac Toe Game!'
          }];

          this.db.collection('chat').doc(this.playersObject.roomId).set({ 'texts': defaultChatText }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });

          this.db.collection('defaultRooms').doc(playersObj.roomId).update({ 'largeMap': this.largeTestArray })

          this.db.collection('defaultRooms').doc(playersObj.roomId).get().subscribe(
            (roomDatas: any) => {
              this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'playerSwitch': false }, { merge: true });
              this.fieldsMedium = roomDatas.data().largeMap
              this.createLargeBoard(playersObj);
              this.firstPlayerTurnToFirebase = roomDatas.data().firstPlayerTurn;
              this.secondPlayerTurnToFirebase = roomDatas.data().secondPlayerTurn;

              if (playersObj.firstPlayerName === localStorage.getItem('username') && roomDatas.data().firstPlayerTurn) {
                this.localTestIcon = playersObj.firstPalyerselectedIcon;

                this.setPointerEvents('auto');

              }

              if (playersObj.secondPlayerName === localStorage.getItem('username') && !roomDatas.data().secondPlayerTurn) {
                this.localTestIcon = playersObj.secondPalyerselectedIcon;


                this.setPointerEvents('none');
              }

            },
            (err) => { console.log(err) },
            () => {
              const subscription = this.db.collection('defaultRooms').doc(this.playersObject.roomId).valueChanges().subscribe(
                (roomDatas: any) => {
                  this.fieldsLarge = roomDatas.largeMap
                  this.changeAllFields()

                  if (playersObj.firstPlayerName === localStorage.getItem('username') && roomDatas.firstPlayerTurn) {

                    this.setPointerEvents('auto');
                    this.localTestIcon = playersObj.firstPalyerselectedIcon;
                    this.changeAllFields()

                  }

                  if (playersObj.firstPlayerName === localStorage.getItem('username') && !roomDatas.firstPlayerTurn) {

                    this.setPointerEvents('none');
                    this.localTestIcon = playersObj.secondPalyerselectedIcon;


                  }

                  if (playersObj.secondPlayerName === localStorage.getItem('username') && !roomDatas.secondPlayerTurn) {

                    this.localTestIcon = playersObj.firstPalyerselectedIcon;

                    this.setPointerEvents('none');

                  }

                  if (playersObj.secondPlayerName === localStorage.getItem('username') && roomDatas.secondPlayerTurn) {


                    this.setPointerEvents('auto');
                    this.localTestIcon = playersObj.secondPalyerselectedIcon;
                    this.changeAllFields()
                  }

                  //check each player's ready for new game status, if both of them are true, start a new game
                  let dbFirstPlayer = roomDatas.firstPlayer;
                  let dbSecondPlayer = roomDatas.secondPlayer;
                  //check each player's ready status for new game, to show text that the other player is ready 
                  if (dbFirstPlayer.readyForNewGame && playersObj.secondPlayerName === localStorage.getItem('username')) {
                    this.otherPlayerReady = true;
                    setTimeout(() => {
                      this.otherPlayerReady = false;
                    }, 5000);
                  }

                  if (dbSecondPlayer.readyForNewGame && playersObj.firstPlayerName === localStorage.getItem('username')) {
                    this.otherPlayerReady = true;
                    setTimeout(() => {
                      this.otherPlayerReady = false;
                    }, 5000);
                  }

                  if (dbFirstPlayer.readyForNewGame && dbSecondPlayer.readyForNewGame) {
                    this.otherPlayerReady = false;
                    this.createNewGame();
                    //if new game started, unsubs for other changes
                    //subscription.unsubscribe();
                  }

                  if (dbFirstPlayer.leftTheGame) {
                    //this.leaveGame();
                    if (playersObj.secondPlayerName === localStorage.getItem('username')) {
                      subscription.unsubscribe();
                      this.openLeftTheGameModal();
                    }
                  }

                  if (dbSecondPlayer.leftTheGame) {
                    //this.leaveGame();
                    if (playersObj.firstPlayerName === localStorage.getItem('username')) {
                      subscription.unsubscribe();
                      this.openLeftTheGameModal();
                    }
                  }

                  //check if a player reloaded the site or lost connection 
                  if (roomDatas.detectedReload) {
                    this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'detectedReload': false }, { merge: true })
                      .then(() => {
                        if (this.playersObject.type === "custom") {
                          this.db.collection('defaultRooms').doc(this.playersObject.roomId).delete();
                        }
                      })
                      .then(() => {
                        Swal.fire({
                          imageUrl: 'https://images.pexels.com/photos/4439425/pexels-photo-4439425.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
                          title: 'Your opponent lost connection!',
                          showConfirmButton: true,
                          confirmButtonText: 'Leave room',
                        }).then((res) => {
                          if (res.isConfirmed) {
                            window.location.href = '/rooms';
                          }
                          if (res.isDismissed) {
                            window.location.href = '/rooms';
                          }
                        });
                      })
                      .then(() => {
                        //send false value to navbar = leave room is invisible
                        this.mapSizeService.inTheGame.next(false);
                        //this.router.navigate(['/rooms'])
                      })
                      .catch(err => console.log(err))
                  }

                },
                (err) => { console.log(err) },
                () => { }
              )

            }
          )


        }

        if (playersObj.thirdPlayerName !== "" && playersObj.thirdPalyerselectedIcon !== "") {
          this.threePlayerGame = true;
          this.thirdPlayerName = playersObj.thirdPlayerName;
          this.whoIsTheNextPlayer = [this.firstPlayerName, this.secondPlayerName, this.thirdPlayerName];
          this.currentPlayer = this.firstPlayerName;


        }

      },
      (err) => { console.log(err) },
    )

    // ------- SUBSCRIBE TO CHAT -------
    this.db.collection('chat').doc(this.playersObject.roomId).valueChanges().subscribe(

      (data: any) => {
        this.updatedTextArray = data.texts;
        if (this.updatedTextArray[this.updatedTextArray.length - 1] === 'Welcome') {
          this.notificationIsVisible = false;
        }


        if (this.updatedTextArray[this.updatedTextArray.length - 1] !== 'Welcome') {

          if (this.updatedTextArray[this.updatedTextArray.length - 1].player === 'firstPlayer' && this.playersObject.secondPlayerName === localStorage.getItem('username')) {
            this.notificationIsVisible = true;
          }

          if (this.updatedTextArray[this.updatedTextArray.length - 1].player === 'secondPlayer' && this.playersObject.firstPlayerName === localStorage.getItem('username')) {
            this.notificationIsVisible = true;
          }
        }


      },
      (err) => { console.log(err) },
      () => { }

    );

  }

  //open left the game modal
  openLeftTheGameModal() {
    Swal.fire({
      imageUrl: 'https://images.pexels.com/photos/1529753/pexels-photo-1529753.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      title: 'Your opponent left the game!',
      showConfirmButton: true,
      confirmButtonText: 'Leave room',
    }).then((res) => {
      if (res.isConfirmed) {
        this.leaveGame();
        /* setTimeout(() => {
          location.reload();
        }, 50); */
      }
      if (res.isDismissed) {
        this.leaveGame()
        /* setTimeout(() => {
          location.reload();
        }, 50); */
      }
    });
  }


  //leave game 
  leaveGame = () => {
    let localFirstPlayer: any;
    let localSecondPlayer: any;
    let room: any;
    //reset dataBase
    this.db.collection('defaultRooms').doc(this.playersObject.roomId).get().subscribe(
      (roomData: any) => {
        localFirstPlayer = roomData.data().firstPlayer;
        localSecondPlayer = roomData.data().secondPlayer;
        room = roomData.data();
      },
      (err) => { console.log(err) },
      () => {
        //if I am the first player reset firstplayer in database
        if (this.playersObject.firstPlayerName === localStorage.getItem('username')) {
          localFirstPlayer.leftTheGame = true;
          localFirstPlayer.inTheRoom = false;
          localFirstPlayer.ready = false;
          localFirstPlayer.symbol = "";
          localFirstPlayer.username = "";
          localFirstPlayer.readyForNewGame = false;

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayer': localFirstPlayer }, { merge: true })
            .then(() => {
              //delete local storage
              localStorage.removeItem('username');
              //remove leave room button
              this.mapSizeService.inTheGame.next(false);
              this.mapSizeService.mapSize.next(null);
            })
            .then(() => {
              //if it's a custom room delete it
              setTimeout(() => {
                if (room.type === 'custom') {
                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).delete();
                }
              }, 200);
            })
            .then(() => {
              //navigate to rooms component
              this.router.navigate(['/rooms'])
            })
            .catch(err => console.log(err))
        }


        //if I am the second player reset secondplayer in database
        if (this.playersObject.secondPlayerName === localStorage.getItem('username')) {
          localSecondPlayer.leftTheGame = true;
          localSecondPlayer.inTheRoom = false;
          localSecondPlayer.ready = false;
          localSecondPlayer.symbol = "";
          localSecondPlayer.username = "";
          localSecondPlayer.readyForNewGame = false;
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayer': localSecondPlayer }, { merge: true })
            .then(() => {
              //delete local storage
              localStorage.removeItem('username');
            })
            .then(() => {
              //if it's a custom room delete it
              if (room.type === 'custom') {
                this.db.collection('defaultRooms').doc(this.playersObject.roomId).delete();
              }
            })
            .then(() => {
              //remove leave room button
              this.mapSizeService.inTheGame.next(false);
              this.mapSizeService.mapSize.next(null);
              //navigate to rooms component
              this.router.navigate(['/rooms'])
            })
            .catch(err => console.log(err))
        }


      }
    );

  }


  //-----------------Similar functions-------------

  //New Game function
  createNewGame = () => {
    //get each player data
    let localFirstPlayer: any;
    let localSecondPlayer: any;
    //get players data to edit it
    this.db.collection('defaultRooms').doc(this.playersObject.roomId).get().subscribe(
      (roomData: any) => {
        localFirstPlayer = roomData.data().firstPlayer;
        localSecondPlayer = roomData.data().secondPlayer;
      },
      (err) => { console.log(err) },
      () => {
        //set each player ready for new game status to false by default
        //first player
        localFirstPlayer.readyForNewGame = false;
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayer': localFirstPlayer }, { merge: true })

        //second player 
        localSecondPlayer.readyForNewGame = false;
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayer': localSecondPlayer }, { merge: true })

      }
    );

    //give a point to the player who wins the round

    if (localStorage.getItem('winner') === this.playersObject.firstPlayerName) {
      this.firstPlayerWonCounter++;
      localStorage.removeItem('winner')
    }

    if (localStorage.getItem('winner') === this.playersObject.secondPlayerName) {
      this.secondPlayerWonCounter++;
      localStorage.removeItem('winner')
    }

    //render game
    if (this.playersObject.map === "small") {
      this.createANewSmallGame();
    } else if (this.playersObject.map === "medium") {
      this.createANewMediumGame();
    } else if (this.playersObject.map === 'large') {
      this.createANewLargeGame();
    }
  }

  //after first game finished, get ready for an other 
  getReadyForNextGame() {
    let localFirstPlayer: any;
    let localSecondPlayer: any;
    this.localTestFieldsFirstPlayer = [];
    this.localTestFieldsSecondPlayer = [];
    //get players data to edit it
    this.db.collection('defaultRooms').doc(this.playersObject.roomId).get().subscribe(
      (roomData: any) => {
        localFirstPlayer = roomData.data().firstPlayer;
        localSecondPlayer = roomData.data().secondPlayer;
      },
      (err) => { console.log(err) },
      () => {
        //if I am the first player set firstplayer's ready for the next game
        if (this.playersObject.firstPlayerName === localStorage.getItem('username')) {
          localFirstPlayer.readyForNewGame = true;
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayer': localFirstPlayer }, { merge: true })
        }


        //if I am the second player set secondplayer's ready for the next game
        if (this.playersObject.secondPlayerName === localStorage.getItem('username')) {
          localSecondPlayer.readyForNewGame = true;
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayer': localSecondPlayer }, { merge: true })
        }
      }
    );




  }

  //Array cutter
  chunkArray = (myArray, chunk_size) => {
    let index = 0;
    let arrayLength = myArray.length;
    let tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
      let myChunk = myArray.slice(index, index + chunk_size);

      tempArray.push(myChunk);
    }

    return tempArray;
  }

  //Pointer events on-off
  setPointerEvents(status: string) {
    //--- SMALL 3X3 MAP ---
    if (this.playersObject.map === 'small') {
      let allFields = document.querySelectorAll('.fieldsSmall');

      allFields.forEach((field, index) => {

        ((field) as HTMLElement).style.pointerEvents = status;
      })
    }

    //--- MEDIUM 5X5 MAP ---
    if (this.playersObject.map === 'medium') {
      let allFields = document.querySelectorAll('.fieldsMedium');

      allFields.forEach((field, index) => {

        ((field) as HTMLElement).style.pointerEvents = status;
      })
    }

    //--- LARGE 10X10 MAP ---
    if (this.playersObject.map === 'large') {
      let allFields = document.querySelectorAll('.fieldsLarge');

      allFields.forEach((field, index) => {

        ((field) as HTMLElement).style.pointerEvents = status;
      })
    }
  }

  getCurrentSquare = (field, index, playersObj) => {

    let nextTurnText = document.getElementById("next-player-text");

    if (!this.threePlayerGame) {

      this.firstPlayerTurn = !this.firstPlayerTurn;


      let playerSwitch = false;


      this.db.collection('defaultRooms').doc(this.playersObject.roomId).get().subscribe(
        (mapData: any) => {
          playerSwitch = mapData.data().playerSwitch
        },
        (err) => { console.log(err) },
        () => { this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'playerSwitch': !playerSwitch }, { merge: true }) },
      )

      // Player switch to database
      this.db.collection('defaultRooms').doc(this.playersObject.roomId).get().subscribe(
        (mappData: any) => {
          if (mappData.data().playerSwitch) {
            this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
            this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true })

            this.localTestFieldsFirstPlayer.push(index + 1);

            this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfFirstPlayer': this.localTestFieldsFirstPlayer }, { merge: true })





            field.innerText = this.localTestIcon;
          } else {
            this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerTurn': false }, { merge: true });
            this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerTurn': true }, { merge: true });

            this.localTestFieldsSecondPlayer.push(index + 1);

            this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfSecondPlayer': this.localTestFieldsSecondPlayer }, { merge: true })

            field.innerText = this.localTestIcon;
          }

        },
        (err) => { console.log(err) },
        () => {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).valueChanges().subscribe(
            (mapData: any) => {
              if (mapData.firstPlayerTurn) {

                //Who is the next player
                nextTurnText.innerText = `Következő játékos: ${playersObj.firstPlayerName} ${playersObj.firstPalyerselectedIcon} `

              } else {
                //Who is the next player
                nextTurnText.innerText = `Következő játékos: ${playersObj.secondPlayerName} ${playersObj.secondPalyerselectedIcon} `;
              }
            },
            (err) => { console.log(err) },
            () => { }
          )
        }
      )




      // field.innerText = this.firstPlayerTurn ? playersObj.firstPalyerselectedIcon : playersObj.secondPalyerselectedIcon;

      // this.fieldsSmall[index] = this.firstPlayerTurn ? playersObj.firstPalyerselectedIcon : playersObj.secondPalyerselectedIcon;
      this.fieldsSmall[index] = this.localTestIcon;
      this.fieldsMedium[index] = this.localTestIcon
      this.fieldsLarge[index] = this.localTestIcon


      if (this.playersObject.map === 'small') {
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'smallMap': this.fieldsSmall })
        // .then(() => {
      }

      //medium map reset
      if (this.playersObject.map === 'medium') {
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'mediumMap': this.fieldsMedium })
      }

      //large map reset
      if (this.playersObject.map === 'large') {
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'largeMap': this.fieldsLarge })
      }


      /* 
            if (this.firstPlayerTurn) {
              this.fieldsOfFirstPlayer.push(index + 1);
      
              nextTurnText.innerText = `Következő játékos: ${playersObj.secondPlayerName} ${playersObj.secondPalyerselectedIcon} `;
      
            } else {
              this.fieldsOfSecondPlayer.push(index + 1);
      
              this.db.collection('defaultRooms').doc('Z5rEpxctEhn7Y4LdzIkZ').set({ 'fieldOfSecondPlayer': this.fieldsOfSecondPlayer }, { merge: true })
      
              nextTurnText.innerText = `Következő játékos: ${playersObj.firstPlayerName} ${playersObj.firstPalyerselectedIcon} `
      
            } */


    }



    //Three player-------------------------------------------->

    //Who is the current player
    if (this.threePlayerGame) {

      if (this.indexOfPlayersArray <= this.whoIsTheNextPlayer.length - 2) {
        this.indexOfPlayersArray += 1;
        this.currentPlayer = this.whoIsTheNextPlayer[this.indexOfPlayersArray];

      } else {
        this.indexOfPlayersArray = 0;
        this.currentPlayer = this.whoIsTheNextPlayer[this.indexOfPlayersArray];

      }

      //Add icon to field
      //first player
      if (this.currentPlayer === playersObj.firstPlayerName) {
        // field.innerText = playersObj.firstPalyerselectedIcon;
        //Small map
        this.fieldsSmall[index] = playersObj.firstPalyerselectedIcon;

        //Medium map
        this.fieldsMedium[index] = playersObj.firstPalyerselectedIcon;

        //Large map
        this.fieldsLarge[index] = playersObj.firstPalyerselectedIcon;

        this.fieldsOfFirstPlayer.push(index + 1);
        nextTurnText.innerText = `Következő játékos: ${playersObj.secondPlayerName} ${playersObj.secondPalyerselectedIcon} `
      }
      //second player
      else if (this.currentPlayer === playersObj.secondPlayerName) {
        // field.innerText = playersObj.secondPalyerselectedIcon
        //Small map
        this.fieldsSmall[index] = playersObj.secondPalyerselectedIcon;

        //Medium map
        this.fieldsMedium[index] = playersObj.secondPalyerselectedIcon;

        //Large map
        this.fieldsLarge[index] = playersObj.secondPalyerselectedIcon;

        this.fieldsOfSecondPlayer.push(index + 1);
        nextTurnText.innerText = `Következő játékos: ${playersObj.thirdPlayerName} ${playersObj.thirdPalyerselectedIcon} `
      }
      //third player
      else if (this.currentPlayer === playersObj.thirdPlayerName) {
        // field.innerText = playersObj.thirdPalyerselectedIcon
        //Small map
        this.fieldsSmall[index] = playersObj.thirdPalyerselectedIcon;
        //Medium map
        this.fieldsMedium[index] = playersObj.thirdPalyerselectedIcon;

        //Large map
        this.fieldsLarge[index] = playersObj.thirdPalyerselectedIcon;

        this.fieldsOfThirdPlayer.push(index + 1);
        nextTurnText.innerText = `Következő játékos: ${playersObj.firstPlayerName} ${playersObj.firstPalyerselectedIcon} `
      }


    }

  }

  //Player functions

  //First player
  firstPlayerIsTheWinner = () => {
    const firstPlayerWonText = document.getElementById("winnerPlayerText");
    const newGameBtn = document.getElementById('new-game-btn');
    const winnerBox = document.getElementById("winner-box");

    let setStyleAndWonCounter = () => {
      this.winnerFirstPlayer = true;
      /*   this.winnerFirstPlayerMediumBoard = true
        this.winnerFirstPlayerLargeBoard = true */
      this.setPointerEvents('none');
      winnerBox.classList.add("winner-box");
      newGameBtn.style.display = 'block';
      firstPlayerWonText.style.display = "block";
      firstPlayerWonText.innerText = `${this.playersObject.secondPlayerName} WON`;
      //this.firstPlayerWonCounter++;

      //set the winner name to localStorage
      localStorage.setItem('winner', this.playersObject.secondPlayerName);
      this.firstPlayerTurn = true;
    }



    const subscription = this.db.collection('defaultRooms').doc(this.playersObject.roomId).valueChanges().subscribe(
      (mapData: any) => {
        for (let chance of this.chanceOfWinning) {
          if (chance.every(boxes => mapData.fieldOfFirstPlayer.includes(boxes))) {
            setStyleAndWonCounter();

            if (this.playersObject.map === 'small') {

              //reset user's array 
              this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'smallMap': this.smallTestArray })
                .then(() => {
                  const defaultArray = [];
                  //set player arrays to default at game start 
                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

                  //set turn booleans to default
                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });

                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });
                })
                .catch(err => console.log(err))

            }

          }
        }



        //subscription.unsubscribe(); 

      },
      (err) => { console.log(err) },

    )

    this.db.collection('defaultRooms').doc(this.playersObject.roomId).valueChanges().subscribe(
      (dataMap: any) => {
        if (dataMap.firstPlayerIsTheWinner) {

          setStyleAndWonCounter();
          //reset user's array 

        }

      },
      (err) => { console.log(err) },
      () => { }
    )

    if (this.winnerFirstPlayerMediumBoard) {
      this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'mediumMap': this.mediumTestArray })
        .then(() => {
          const defaultArray = [];
          //set player arrays to default at game start 
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

          //set turn booleans to default
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': false }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': false }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });
        })
        .catch(err => console.log(err))

    }

    if (this.winnerFirstPlayerLargeBoard) {
      this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'largeMap': this.largeTestArray })
        .then(() => {
          const defaultArray = [];
          //set player arrays to default at game start 
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

          //set turn booleans to default
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': false }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': false }, { merge: true });
        })
        .catch(err => console.log(err))

    }

  }

  //Second player

  secondPlayerIsTheWinner = () => {
    const secondPlayerWonText = document.getElementById("winnerPlayerText");
    const newGameBtn = document.getElementById('new-game-btn');
    const winnerBox = document.getElementById("winner-box");

    let setStyleAndWonCounter = () => {
      this.winnerSecondPlayer = true;
      this.setPointerEvents('none');
      winnerBox.classList.add("winner-box");
      newGameBtn.style.display = 'block';
      secondPlayerWonText.style.display = "block";
      secondPlayerWonText.innerText = `${this.playersObject.firstPlayerName} WON`;
      //this.secondPlayerWonCounter++;
      //set the winner name to localStorage
      localStorage.setItem('winner', this.playersObject.firstPlayerName);
      this.firstPlayerTurn = false;
    }


    const subscription = this.db.collection('defaultRooms').doc(this.playersObject.roomId).valueChanges().subscribe(
      (mapData: any) => {
        for (let chance of this.chanceOfWinning) {
          if (chance.every(boxes => mapData.fieldOfSecondPlayer.includes(boxes))) {

            setStyleAndWonCounter();

            if (this.playersObject.map === 'small') {

              //reset user's array 
              this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'smallMap': this.smallTestArray })
                .then(() => {
                  const defaultArray = [];
                  //set player arrays to default at game start 
                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

                  //set turn booleans to default
                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });

                  this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });
                })
                .catch(err => console.log(err))

            }


          }
        }

        //subscription.unsubscribe(); 
      },
      (err) => { console.log(err) },
      () => { }

    )

    this.db.collection('defaultRooms').doc(this.playersObject.roomId).valueChanges().subscribe(
      (dataMap: any) => {
        if (dataMap.secondPlayerIsTheWinner) {
          setStyleAndWonCounter();
          //reset user's array 

        }

      },
      (err) => { console.log(err) },
      () => { }
    )





    if (this.winnerSecondPlayerMediumBoard) {
      this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'mediumMap': this.mediumTestArray })
        .then(() => {
          const defaultArray = [];
          //set player arrays to default at game start 
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

          //set turn booleans to default
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': false }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': false }, { merge: true });
        })
        .catch(err => console.log(err))

    }


    if (this.winnerSecondPlayerLargeBoard) {
      //reset user's array 
      this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'largeMap': this.largeTestArray })
        .then(() => {
          const defaultArray = [];
          //set player arrays to default at game start 
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

          //set turn booleans to default
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });

          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': false }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': false }, { merge: true });
        })
        .catch(err => console.log(err))
    }

  }

  //Third player

  thirdPlayerIsTheWinner = () => {
    const thirdPlayerWonText = document.getElementById("winnerPlayerText");
    const newGameBtn = document.getElementById('new-game-btn');
    const winnerBox = document.getElementById("winner-box");

    let setStyleAndWonCounter = () => {
      this.winnerThirdPlayer = true;
      this.setPointerEvents('none');
      winnerBox.classList.add("winner-box");
      newGameBtn.style.display = 'block';
      thirdPlayerWonText.style.display = "block";
      thirdPlayerWonText.innerText = `${this.thirdPlayerName} NYERT`;
      this.thirdPlayerWonCounter++;
      this.firstPlayerTurn = false;
    }

    for (let chance of this.chanceOfWinning) {
      if (chance.every(boxes => this.fieldsOfThirdPlayer.includes(boxes))) {

        setStyleAndWonCounter();

      }
    }

    if (this.winnerThirdPlayerMediumBoard) {

      setStyleAndWonCounter();

    }
  }

  //Check end of the game

  async checkEndOfTheGame() {
    const drawText = document.getElementById("winnerPlayerText");
    const newGameBtn = document.getElementById('new-game-btn');
    const winnerBox = document.getElementById("winner-box");

    let setStyle = () => {
      this.setPointerEvents('none');
      winnerBox.classList.add("winner-box");
      newGameBtn.style.display = 'block';
      drawText.style.display = "block";
      drawText.innerText = 'Draw';
    }

    if (!this.threePlayerGame) {

      if (!this.gameIsOver && !this.fieldsSmall.includes(0) && !this.winnerFirstPlayer && !this.winnerSecondPlayer) {
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': true }, { merge: true });
        // setStyle();
      }

      if (!this.gameIsOver && !this.fieldsMedium.includes(0) && !this.winnerFirstPlayer && !this.winnerSecondPlayer) {
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': true }, { merge: true });
        // setStyle();
      }


    } else if (this.threePlayerGame) {

      if (!this.gameIsOver && !this.fieldsSmall.includes(0) && !this.winnerFirstPlayer && !this.winnerSecondPlayer && !this.winnerThirdPlayer) {

        setStyle();
      }

      if (!this.gameIsOver && !this.fieldsMedium.includes(0) && !this.winnerFirstPlayer && !this.winnerSecondPlayer && !this.winnerThirdPlayer) {

        setStyle();
      }
    }



    await this.db.collection('defaultRooms').doc(this.playersObject.roomId).valueChanges().subscribe(

      (dataMap: any) => {
        if (dataMap.draw === true) {

          setStyle();
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'draw': false }, { merge: true });

          //small map reset
          if (this.playersObject.map === 'small') {
            this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'smallMap': this.smallTestArray })
            // .then(() => {
          }

          //medium map reset
          if (this.playersObject.map === 'medium') {
            this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'mediumMap': this.mediumTestArray })
          }

          //large map reset
          if (this.playersObject.map === 'large') {
            this.db.collection('defaultRooms').doc(this.playersObject.roomId).update({ 'largeMap': this.largeTestArray })
          }


          const defaultArray = [];
          //set player arrays to default at game start 
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

          //set turn booleans to default
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });




        }


      },
      (err) => { console.log(err) }
    );


  }

  changeAllFields() {
    // let allFields = document.querySelectorAll('.fieldsSmall');
    let allFields

    if (this.playersObject.map === 'small') {
      allFields = document.querySelectorAll('.fieldsSmall');

      this.fieldsSmall.forEach((field, index) => {
        if (field === 0) {

          allFields[index].innerHTML = "";
        } else {
          allFields[index].innerHTML = field;
          (allFields[index] as HTMLElement).style.pointerEvents = 'none';
        }

      });
    }

    if (this.playersObject.map === 'medium') {
      allFields = document.querySelectorAll('.fieldsMedium');

      this.fieldsMedium.forEach((field, index) => {
        if (field === 0) {

          allFields[index].innerHTML = "";
        } else {
          allFields[index].innerHTML = field;
          (allFields[index] as HTMLElement).style.pointerEvents = 'none';
        }

      });
    }

    if (this.playersObject.map === 'large') {
      allFields = document.querySelectorAll('.fieldsLarge');

      this.fieldsLarge.forEach((field, index) => {
        if (field === 0) {

          allFields[index].innerHTML = "";
        } else {
          allFields[index].innerHTML = field;
          (allFields[index] as HTMLElement).style.pointerEvents = 'none';
        }

      });
    }


  }



  //-----------------Small Board Creating START-------------
  createSmallBoard = (playersObject: any) => {
    const defaultArray = [];
    //set player arrays to default at game start 
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

    //set turn booleans to default
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });


    this.gameIsOver = false;
    const smallBoard: HTMLElement = document.querySelector('.board');

    //ONLINE
    this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'smallMap': this.fieldsSmall }, { merge: true });

    const smallField = this.db.collection('defaultRooms').doc(this.playersObject.roomId)

    this.fieldsSmall.forEach((field, index) => {
      if (this.gameIsOver) {
        smallBoard.innerText = '';
      }

      let fieldSmallDiv = document.createElement('div');

      fieldSmallDiv.setAttribute('class', 'field fieldsSmall');

      fieldSmallDiv.style.border = "2px solid #ffe3ded2";
      fieldSmallDiv.style.width = "33.3%";
      fieldSmallDiv.style.height = "33.3%";
      fieldSmallDiv.style.color = "#ffe3ded2";
      fieldSmallDiv.style.fontSize = "1em";
      fieldSmallDiv.style.display = "flex";
      fieldSmallDiv.style.justifyContent = "center";
      fieldSmallDiv.style.alignItems = "center";
      fieldSmallDiv.style.cursor = "pointer";
      // fieldSmallDiv.innerHTML = field;




      fieldSmallDiv.addEventListener('click', () => {

        this.changeAllFields();

        this.getCurrentSquare(fieldSmallDiv, index, playersObject);
        fieldSmallDiv.style.pointerEvents = 'none';

        //chances of winning
        this.chancesOfWinningSmallBoard();

        //Who is the winner?
        if (!this.threePlayerGame) {
          this.firstPlayerIsTheWinner();
          this.secondPlayerIsTheWinner();


        } else if (this.threePlayerGame) {
          this.firstPlayerIsTheWinner();
          this.secondPlayerIsTheWinner();
          this.thirdPlayerIsTheWinner();
        }

        //Draw?
        this.checkEndOfTheGame();

      })

      smallBoard.appendChild(fieldSmallDiv);

    });

  }




  chancesOfWinningSmallBoard = () => {
    //Chances and diagonal
    this.chanceOfWinning = [[1, 5, 9], [7, 5, 3]];

    //Small board
    let smallBoard = [[1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]];

    for (let x = 0; x < smallBoard.length; x++) {

      this.chanceOfWinning.push(
        //Horizontal
        smallBoard[x]
      )
      for (let y = 0; y < smallBoard[x].length - 2; y++) {

        //Vertical
        this.chanceOfWinning.push(
          [smallBoard[y][x],
          smallBoard[y + 1][x],
          smallBoard[y + 2][x]]
        )

      }
    }


  }






  createANewSmallGame() {
    const winnerText = document.getElementById("winnerPlayerText");
    const winnerBox = document.getElementById("winner-box");
    let allFields = document.querySelectorAll('.fieldsSmall');
    const newGameBtn = document.getElementById('new-game-btn');
    this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'playerSwitch': false }, { merge: true });

    this.gameIsOver = false;
    this.winnerFirstPlayer = false;
    this.winnerSecondPlayer = false;
    this.winnerThirdPlayer = false;
    this.fieldsOfFirstPlayer = [];
    this.fieldsOfSecondPlayer = [];
    this.fieldsOfThirdPlayer = [];
    // this.fieldsSmall = Array(9).fill(0);


    /* this.fieldsMedium = Array(25).fill(0);
    this.fieldsLarge = Array(100).fill(0); */


    allFields.forEach(field => {
      field.innerHTML = '';
      ((field) as HTMLElement).style.pointerEvents = 'auto';
    })
    newGameBtn.style.display = 'none';
    winnerText.style.display = "none";
    winnerBox.classList.remove("winner-box");


  }



  //-----------------Small Board Creating END----------------------

  //-----------------Medium Board Creating START----------------------
  createMediumBoard = (playersObject: any) => {
    const defaultArray = [];
    //set player arrays to default at game start 
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

    //set turn booleans to default
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });



    this.gameIsOver = false;
    const mediumBoard: HTMLElement = document.querySelector('.board');

    //ONLINE
    this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'mediumMap': this.fieldsMedium }, { merge: true });

    this.fieldsMedium.forEach((field, index) => {
      if (this.gameIsOver) {
        mediumBoard.innerText = '';
      }

      let fieldMediumDiv = document.createElement('div');

      fieldMediumDiv.setAttribute('class', 'field fieldsMedium');

      fieldMediumDiv.style.border = "2px solid #ffe3ded2";
      fieldMediumDiv.style.width = "20%";
      fieldMediumDiv.style.height = "20%";
      fieldMediumDiv.style.color = "#ffe3ded2";
      fieldMediumDiv.style.fontSize = "1em";
      fieldMediumDiv.style.display = "flex";
      fieldMediumDiv.style.justifyContent = "center";
      fieldMediumDiv.style.alignItems = "center";
      fieldMediumDiv.style.cursor = "pointer";


      fieldMediumDiv.addEventListener('click', () => {

        this.changeAllFields();

        this.getCurrentSquare(fieldMediumDiv, index, playersObject);
        fieldMediumDiv.style.pointerEvents = 'none';

        //chances of winning
        this.chancesOfWinningMediumBoard(playersObject);

        //Who is the winner?
        if (!this.threePlayerGame) {

          this.firstPlayerIsTheWinner();
          this.secondPlayerIsTheWinner();

        } else if (this.threePlayerGame) {
          this.firstPlayerIsTheWinner();
          this.secondPlayerIsTheWinner();
          this.thirdPlayerIsTheWinner();
        }

        //Draw?
        this.checkEndOfTheGame();
      })

      mediumBoard.appendChild(fieldMediumDiv);

    });

  }

  chancesOfWinningMediumBoard(playersObject: any) {

    let chunkedArray = this.chunkArray(this.fieldsMedium, 5)

    //Horizontal winning chance
    let horizontalWinningChance = (selectedIcon, x) => {
      return chunkedArray[x][0] === selectedIcon && chunkedArray[x][1] === selectedIcon && chunkedArray[x][2] === selectedIcon ||
        chunkedArray[x][1] === selectedIcon && chunkedArray[x][2] === selectedIcon && chunkedArray[x][3] === selectedIcon ||
        chunkedArray[x][2] === selectedIcon && chunkedArray[x][3] === selectedIcon && chunkedArray[x][4] === selectedIcon
    }

    //Vertical winning chance

    let verticalWinningChance = (selectedIcon, y) => {
      return chunkedArray[0][y] === selectedIcon && chunkedArray[1][y] === selectedIcon && chunkedArray[2][y] === selectedIcon ||
        chunkedArray[1][y] === selectedIcon && chunkedArray[2][y] === selectedIcon && chunkedArray[3][y] === selectedIcon ||
        chunkedArray[2][y] === selectedIcon && chunkedArray[3][y] === selectedIcon && chunkedArray[4][y] === selectedIcon
    }

    //Diagonal winning chance
    let diagonalWinningChance = (selectedIcon, y) => {
      return chunkedArray[y][y] === selectedIcon && chunkedArray[y + 1][y + 1] === selectedIcon && chunkedArray[y + 2][y + 2] === selectedIcon ||
        chunkedArray[y][y + 1] === selectedIcon && chunkedArray[y + 1][y + 2] === selectedIcon && chunkedArray[y + 2][y + 3] === selectedIcon ||
        chunkedArray[0][y + 2] === selectedIcon && chunkedArray[1][3] === selectedIcon && chunkedArray[2][4] === selectedIcon ||
        chunkedArray[1][0] === selectedIcon && chunkedArray[2][1] === selectedIcon && chunkedArray[3][2] === selectedIcon ||
        chunkedArray[2][1] === selectedIcon && chunkedArray[3][2] === selectedIcon && chunkedArray[4][3] === selectedIcon ||
        chunkedArray[2][0] === selectedIcon && chunkedArray[3][1] === selectedIcon && chunkedArray[4][2] === selectedIcon ||
        chunkedArray[4][0] === selectedIcon && chunkedArray[3][1] === selectedIcon && chunkedArray[2][2] === selectedIcon ||
        chunkedArray[3][1] === selectedIcon && chunkedArray[2][2] === selectedIcon && chunkedArray[1][3] === selectedIcon ||
        chunkedArray[2][0] === selectedIcon && chunkedArray[1][1] === selectedIcon && chunkedArray[0][2] === selectedIcon ||
        chunkedArray[3][0] === selectedIcon && chunkedArray[2][1] === selectedIcon && chunkedArray[1][2] === selectedIcon ||
        chunkedArray[2][1] === selectedIcon && chunkedArray[1][2] === selectedIcon && chunkedArray[0][3] === selectedIcon ||
        chunkedArray[4][1] === selectedIcon && chunkedArray[3][2] === selectedIcon && chunkedArray[2][3] === selectedIcon ||
        chunkedArray[3][2] === selectedIcon && chunkedArray[2][3] === selectedIcon && chunkedArray[1][4] === selectedIcon ||
        chunkedArray[4][2] === selectedIcon && chunkedArray[3][3] === selectedIcon && chunkedArray[2][4] === selectedIcon ||
        chunkedArray[2][2] === selectedIcon && chunkedArray[1][3] === selectedIcon && chunkedArray[0][4] === selectedIcon
    }


    //Horizontal 
    for (let x = 0; x < chunkedArray.length; x++) {

      //First player
      if (horizontalWinningChance(playersObject.firstPalyerselectedIcon, x)) {
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': true }, { merge: true });
        this.winnerFirstPlayer = true;
        this.winnerFirstPlayerMediumBoard = true;
      }

      //Second player


      if (horizontalWinningChance(playersObject.secondPalyerselectedIcon, x)) {
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': true }, { merge: true });
        this.winnerSecondPlayer = true;
        this.winnerSecondPlayerMediumBoard = true;
      }



      //Third player  


      if (horizontalWinningChance(playersObject.thirdPalyerselectedIcon, x)) {

        this.winnerThirdPlayer = true;
        this.winnerThirdPlayerMediumBoard = true;
      }

      //Vertical
      for (let i = 0; i < 5; i++) {

        //First player
        if (verticalWinningChance(playersObject.firstPalyerselectedIcon, i)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': true }, { merge: true });
          this.winnerFirstPlayer = true;
          this.winnerFirstPlayerMediumBoard = true;
        }
        //Second player 

        if (verticalWinningChance(playersObject.secondPalyerselectedIcon, i)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': true }, { merge: true });
          this.winnerSecondPlayer = true;
          this.winnerSecondPlayerMediumBoard = true;
        }

        //Third player  


        if (verticalWinningChance(playersObject.thirdPalyerselectedIcon, i)) {

          this.winnerThirdPlayer = true;
          this.winnerThirdPlayerMediumBoard = true;
        }
      }


      //Diagonal
      for (let y = 0; y < 3; y++) {

        //First player
        if (diagonalWinningChance(playersObject.firstPalyerselectedIcon, y)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': true }, { merge: true });
          this.winnerFirstPlayer = true;
          this.winnerFirstPlayerMediumBoard = true;
        }
        //Second player

        if (diagonalWinningChance(playersObject.secondPalyerselectedIcon, y)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': true }, { merge: true });
          this.winnerSecondPlayer = true;
          this.winnerSecondPlayerMediumBoard = true;
        }

        //Third player  

        if (diagonalWinningChance(playersObject.thirdPalyerselectedIcon, y)) {

          this.winnerThirdPlayer = true;
          this.winnerThirdPlayerMediumBoard = true;
        }
      }

    }

  }

  createANewMediumGame() {
    const winnerText = document.getElementById("winnerPlayerText");
    const winnerBox = document.getElementById("winner-box");
    let allFields = document.querySelectorAll('.fieldsMedium');
    const newGameBtn = document.getElementById('new-game-btn');

    this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'playerSwitch': false }, { merge: true });

    this.gameIsOver = false;
    this.winnerFirstPlayer = false;
    this.winnerSecondPlayer = false;
    this.winnerThirdPlayer = false;
    this.fieldsOfFirstPlayer = [];
    this.fieldsOfFirstPlayer = [];
    this.fieldsOfThirdPlayer = [];
    this.winnerFirstPlayerMediumBoard = false;
    this.winnerSecondPlayerMediumBoard = false;
    this.winnerThirdPlayerMediumBoard = false;
    /*   this.fieldsSmall = Array(9).fill(0);
      this.fieldsMedium = Array(25).fill(0); */
    // this.fieldsLarge = Array(100).fill(0);


    allFields.forEach(field => {
      field.innerHTML = '';

      ((field) as HTMLElement).style.pointerEvents = 'auto';
    })


    newGameBtn.style.display = 'none';
    winnerText.style.display = "none";
    winnerBox.classList.remove("winner-box");



  }


  //-----------------Medium Board Creating END----------------------

  //-----------------Large Board Creating START----------------------
  createLargeBoard = (playersObject: any) => {
    const defaultArray = [];
    //set player arrays to default at game start 
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'fieldOfFirstPlayer': defaultArray }, { merge: true });
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'fieldOfSecondPlayer': defaultArray }, { merge: true });

    //set turn booleans to default
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'firstPlayerTurn': true }, { merge: true });
    this.db.collection('defaultRooms').doc(playersObject.roomId).set({ 'secondPlayerTurn': false }, { merge: true });

    this.gameIsOver = false;
    const largeBoard: HTMLElement = document.querySelector('.board');

    //ONLINE
    this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'largeMap': this.fieldsLarge }, { merge: true });

    this.fieldsLarge.forEach((field, index) => {
      if (this.gameIsOver) {
        largeBoard.innerText = '';
      }

      let fieldLargeDiv = document.createElement('div');

      fieldLargeDiv.setAttribute('class', 'field fieldsLarge');


      fieldLargeDiv.style.width = "10%";
      fieldLargeDiv.style.height = "10%";
      fieldLargeDiv.style.color = "#ffe3ded2";
      fieldLargeDiv.style.fontSize = ".5em";
      fieldLargeDiv.style.display = "flex";
      fieldLargeDiv.style.justifyContent = "center";
      fieldLargeDiv.style.alignItems = "center";
      fieldLargeDiv.style.cursor = "pointer";
      fieldLargeDiv.style.border = "1px solid #ffe3ded2";



      fieldLargeDiv.addEventListener('click', () => {

        this.changeAllFields();


        this.getCurrentSquare(fieldLargeDiv, index, playersObject);
        fieldLargeDiv.style.pointerEvents = 'none';

        //chances of winning
        this.chancesOfWinningLargeBoard(playersObject);

        //Who is the winner?
        if (!this.threePlayerGame) {

          this.firstPlayerIsTheWinner();
          this.secondPlayerIsTheWinner();

        } else if (this.threePlayerGame) {
          this.firstPlayerIsTheWinner();
          this.secondPlayerIsTheWinner();
          this.thirdPlayerIsTheWinner();
        }

        //Draw?
        this.checkEndOfTheGame();
      })

      largeBoard.appendChild(fieldLargeDiv);

    });
  }

  chancesOfWinningLargeBoard = (playersObject: any) => {
    let chunkedArray = this.chunkArray(this.fieldsLarge, 10);

    //Horizontal winning chance
    let horizontalWinningChance = (selectedIcon, x) => {
      return chunkedArray[x][0] === selectedIcon && chunkedArray[x][1] === selectedIcon && chunkedArray[x][2] === selectedIcon && chunkedArray[x][3] === selectedIcon && chunkedArray[x][4] === selectedIcon ||
        chunkedArray[x][1] === selectedIcon && chunkedArray[x][2] === selectedIcon && chunkedArray[x][3] === selectedIcon && chunkedArray[x][4] === selectedIcon && chunkedArray[x][5] === selectedIcon ||
        chunkedArray[x][2] === selectedIcon && chunkedArray[x][3] === selectedIcon && chunkedArray[x][4] === selectedIcon && chunkedArray[x][5] === selectedIcon && chunkedArray[x][6] === selectedIcon ||
        chunkedArray[x][3] === selectedIcon && chunkedArray[x][4] === selectedIcon && chunkedArray[x][5] === selectedIcon && chunkedArray[x][6] === selectedIcon && chunkedArray[x][7] === selectedIcon ||
        chunkedArray[x][4] === selectedIcon && chunkedArray[x][5] === selectedIcon && chunkedArray[x][6] === selectedIcon && chunkedArray[x][7] === selectedIcon && chunkedArray[x][8] === selectedIcon ||
        chunkedArray[x][5] === selectedIcon && chunkedArray[x][6] === selectedIcon && chunkedArray[x][7] === selectedIcon && chunkedArray[x][8] === selectedIcon && chunkedArray[x][9] === selectedIcon

    }


    //Vertical winning chance

    let verticalWinningChance = (selectedIcon, y) => {
      return chunkedArray[0][y] === selectedIcon && chunkedArray[1][y] === selectedIcon && chunkedArray[2][y] === selectedIcon && chunkedArray[3][y] === selectedIcon && chunkedArray[4][y] === selectedIcon ||
        chunkedArray[1][y] === selectedIcon && chunkedArray[2][y] === selectedIcon && chunkedArray[3][y] === selectedIcon && chunkedArray[4][y] === selectedIcon && chunkedArray[5][y] === selectedIcon ||
        chunkedArray[2][y] === selectedIcon && chunkedArray[3][y] === selectedIcon && chunkedArray[4][y] === selectedIcon && chunkedArray[5][y] === selectedIcon && chunkedArray[6][y] === selectedIcon ||
        chunkedArray[3][y] === selectedIcon && chunkedArray[4][y] === selectedIcon && chunkedArray[5][y] === selectedIcon && chunkedArray[6][y] === selectedIcon && chunkedArray[7][y] === selectedIcon ||
        chunkedArray[4][y] === selectedIcon && chunkedArray[5][y] === selectedIcon && chunkedArray[6][y] === selectedIcon && chunkedArray[7][y] === selectedIcon && chunkedArray[8][y] === selectedIcon ||
        chunkedArray[5][y] === selectedIcon && chunkedArray[6][y] === selectedIcon && chunkedArray[7][y] === selectedIcon && chunkedArray[8][y] === selectedIcon && chunkedArray[9][y] === selectedIcon
    }

    //Diagonal winning chance
    let diagonalWinningChance = (selectedIcon, row) => {
      return chunkedArray[row][0] === selectedIcon && chunkedArray[row + 1][1] === selectedIcon && chunkedArray[row + 2][2] === selectedIcon && chunkedArray[row + 3][3] === selectedIcon && chunkedArray[row + 4][4] === selectedIcon ||
        chunkedArray[row][1] === selectedIcon && chunkedArray[row + 1][2] === selectedIcon && chunkedArray[row + 2][3] === selectedIcon && chunkedArray[row + 3][4] === selectedIcon && chunkedArray[row + 4][5] === selectedIcon ||
        chunkedArray[row][2] === selectedIcon && chunkedArray[row + 1][3] === selectedIcon && chunkedArray[row + 2][4] === selectedIcon && chunkedArray[row + 3][5] === selectedIcon && chunkedArray[row + 4][6] === selectedIcon ||
        chunkedArray[row][3] === selectedIcon && chunkedArray[row + 1][4] === selectedIcon && chunkedArray[row + 2][5] === selectedIcon && chunkedArray[row + 3][6] === selectedIcon && chunkedArray[row + 4][7] === selectedIcon ||
        chunkedArray[row][4] === selectedIcon && chunkedArray[row + 1][5] === selectedIcon && chunkedArray[row + 2][6] === selectedIcon && chunkedArray[row + 3][7] === selectedIcon && chunkedArray[row + 4][8] === selectedIcon ||
        chunkedArray[row][5] === selectedIcon && chunkedArray[row + 1][6] === selectedIcon && chunkedArray[row + 2][7] === selectedIcon && chunkedArray[row + 3][8] === selectedIcon && chunkedArray[row + 4][9] === selectedIcon
    }

    let diagonalWinningChanceReverse = (selectedIcon, row) => {
      return chunkedArray[row][0] === selectedIcon && chunkedArray[row - 1][1] === selectedIcon && chunkedArray[row - 2][2] === selectedIcon && chunkedArray[row - 3][3] === selectedIcon && chunkedArray[row - 4][4] === selectedIcon ||
        chunkedArray[row][1] === selectedIcon && chunkedArray[row - 1][2] === selectedIcon && chunkedArray[row - 2][3] === selectedIcon && chunkedArray[row - 3][4] === selectedIcon && chunkedArray[row - 4][5] === selectedIcon ||
        chunkedArray[row][2] === selectedIcon && chunkedArray[row - 1][3] === selectedIcon && chunkedArray[row - 2][4] === selectedIcon && chunkedArray[row - 3][5] === selectedIcon && chunkedArray[row - 4][6] === selectedIcon ||
        chunkedArray[row][3] === selectedIcon && chunkedArray[row - 1][4] === selectedIcon && chunkedArray[row - 2][5] === selectedIcon && chunkedArray[row - 3][6] === selectedIcon && chunkedArray[row - 4][7] === selectedIcon ||
        chunkedArray[row][4] === selectedIcon && chunkedArray[row - 1][5] === selectedIcon && chunkedArray[row - 2][6] === selectedIcon && chunkedArray[row - 3][7] === selectedIcon && chunkedArray[row - 4][8] === selectedIcon ||
        chunkedArray[row][5] === selectedIcon && chunkedArray[row - 1][6] === selectedIcon && chunkedArray[row - 2][7] === selectedIcon && chunkedArray[row - 3][8] === selectedIcon && chunkedArray[row - 4][9] === selectedIcon
    }



    //Horizontal 
    //First player
    for (let x = 0; x < chunkedArray.length; x++) {
      if (horizontalWinningChance(playersObject.firstPalyerselectedIcon, x)) {
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': true }, { merge: true });
        this.winnerFirstPlayer = true;
        this.winnerFirstPlayerLargeBoard = true;
      }



      //Second player
      if (horizontalWinningChance(playersObject.secondPalyerselectedIcon, x)) {
        this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': true }, { merge: true });
        this.winnerSecondPlayer = true;
        this.winnerSecondPlayerLargeBoard = true;
      }





      //Third player  
      if (horizontalWinningChance(playersObject.thirdPalyerselectedIcon, x)) {

        this.winnerThirdPlayer = true;
        this.winnerThirdPlayerMediumBoard = true;
      }


      //Vertical
      for (let i = 0; i < 10; i++) {
        //First player
        if (verticalWinningChance(playersObject.firstPalyerselectedIcon, i)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': true }, { merge: true });
          this.winnerFirstPlayer = true;
          this.winnerFirstPlayerLargeBoard = true;
        }

        //Second player 
        if (verticalWinningChance(playersObject.secondPalyerselectedIcon, i)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': true }, { merge: true });
          this.winnerSecondPlayer = true;
          this.winnerSecondPlayerLargeBoard = true;
        }


        //Third player  
        if (verticalWinningChance(playersObject.thirdPalyerselectedIcon, i)) {

          this.winnerThirdPlayer = true;
          this.winnerThirdPlayerMediumBoard = true;
        }


      }


      //Diagonal

      for (let row = 0; row < chunkedArray.length - 4; row++) {
        //First player
        if (diagonalWinningChance(playersObject.firstPalyerselectedIcon, row)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': true }, { merge: true });
          this.winnerFirstPlayer = true;
          this.winnerFirstPlayerLargeBoard = true;
        }

        //Second player
        if (diagonalWinningChance(playersObject.secondPalyerselectedIcon, row)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': true }, { merge: true });
          this.winnerSecondPlayer = true;
          this.winnerSecondPlayerLargeBoard = true;
        }

        //Third player   
        if (diagonalWinningChance(playersObject.thirdPalyerselectedIcon, row)) {

          this.winnerThirdPlayer = true;
          this.winnerThirdPlayerMediumBoard = true;
        }
      }

      for (let line = 4; line < chunkedArray.length; line++) {
        //First player
        if (diagonalWinningChanceReverse(playersObject.firstPalyerselectedIcon, line)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'firstPlayerIsTheWinner': true }, { merge: true });
          this.winnerFirstPlayer = true;
          this.winnerFirstPlayerLargeBoard = true;
        }

        //Second player
        if (diagonalWinningChanceReverse(playersObject.secondPalyerselectedIcon, line)) {
          this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'secondPlayerIsTheWinner': true }, { merge: true });
          this.winnerSecondPlayer = true;
          this.winnerSecondPlayerLargeBoard = true;
        }
        //Third player 
        if (diagonalWinningChanceReverse(playersObject.thirdPalyerselectedIcon, line)) {

          this.winnerThirdPlayer = true;
          this.winnerThirdPlayerMediumBoard = true;
        }

      }

    }

  }

  createANewLargeGame() {
    const winnerText = document.getElementById("winnerPlayerText");
    const winnerBox = document.getElementById("winner-box");
    let allFields = document.querySelectorAll('.fieldsLarge');
    const newGameBtn = document.getElementById('new-game-btn');

    this.db.collection('defaultRooms').doc(this.playersObject.roomId).set({ 'playerSwitch': false }, { merge: true });

    this.gameIsOver = false;
    this.winnerFirstPlayer = false;
    this.winnerSecondPlayer = false;
    this.winnerThirdPlayer = false;
    this.fieldsOfFirstPlayer = [];
    this.fieldsOfFirstPlayer = [];
    this.fieldsOfThirdPlayer = [];
    this.winnerFirstPlayerLargeBoard = false;
    this.winnerSecondPlayerLargeBoard = false;
    this.winnerSecondPlayerMediumBoard = false;
    this.winnerThirdPlayerMediumBoard = false;
    /*     this.fieldsSmall = Array(9).fill(0);
        this.fieldsMedium = Array(25).fill(0);
        this.fieldsLarge = Array(100).fill(0); */


    allFields.forEach(field => {
      field.innerHTML = '';

      ((field) as HTMLElement).style.pointerEvents = 'auto';
    })


    newGameBtn.style.display = 'none';
    winnerText.style.display = "none";
    winnerBox.classList.remove("winner-box");



  }



  //-----------------Large Board Creating END----------------------


  //---------- LIVE CHAT -------------------

  liveChat() {
    //get previous texts
    this.db.collection('chat').doc(this.playersObject.roomId).get().subscribe(
      (messages: any) => {
        this.updatedTextArray = messages.data().texts;

      },
      (err) => { console.log(err) },
      () => {
        if (this.playersObject.firstPlayerName === localStorage.getItem('username')) {
          let text = {
            text: this.chatInput.nativeElement.value,
            player: 'firstPlayer',
            icon: this.playersObject.firstPalyerselectedIcon
          }


          this.updatedTextArray.push(text);
          //update texts
          this.db.collection('chat').doc(this.playersObject.roomId).set({ 'texts': this.updatedTextArray }, { merge: true })
            .then(() => {
              this.chatInput.nativeElement.value = "";



            })
            .catch(err => console.log(err))

        }

        if (this.playersObject.secondPlayerName === localStorage.getItem('username')) {
          let text = {
            text: this.chatInput.nativeElement.value,
            player: 'secondPlayer',
            icon: this.playersObject.secondPalyerselectedIcon
          }

          this.updatedTextArray.push(text);
          //update texts
          this.db.collection('chat').doc(this.playersObject.roomId).set({ 'texts': this.updatedTextArray }, { merge: true })
            .then(() => {
              this.chatInput.nativeElement.value = "";


            })
            .catch(err => console.log(err))

        }

      }
    );
  }


  //remove message notification 
  removeNotification() {
    this.notificationIsVisible = false;
  }


}
