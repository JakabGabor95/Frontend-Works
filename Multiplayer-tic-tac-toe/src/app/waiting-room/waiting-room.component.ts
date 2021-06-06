import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapSizeService } from '../service/map-size.service';
import { Router } from '@angular/router';
import { FirebaseService } from '../service/firebase.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { merge } from 'rxjs';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.scss']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {

  roomData: any;

  //Array of random names
  randomNamesForGuests = ["3-D Man", "A-Bomb", "A.I.M.", "Aaron Stack", "Abbey", "Abomination",
    "Absorbing Man", "Abyss", "Acolytes", "Adam Destine", "Adam Warlock", "Adrienne", "Aegis",
    "Agent", "Agent Brand", "Agent Liberty", "Agent X", "Agent Zero", "Agents of Atlas", "Aginar",
    "Ahab", "Air-Walker", "Ajak", "Ajaxis", "Akemi", "Alain", "Albert Cleary", "Albion", "Aleta", "Sandman",
    "Santa Claus", "Saracen (Muzzafar Lambert)", "Sasquatch (Walter Langkowski)","Satana","Sauron","Scalphunter",
    "Scarecrow (Ebenezer Laughton)","Scarlet Spider (Ben Reilly)", "Scarlet Spider (Kaine)", "Scarlet Witch",
    "Scarlet Witch (Age of Apocalypse)","Scarlet Witch (Marvel Heroes)","Scarlet Witch (Ultimate)","Scorpion (Carmilla Black)",
    "Scorpion (Ultimate)", "Scourge","Scrambler","Scream (Donna Diego)","Screwball","Sebastian Shaw","Secret Warriors",
    "Selene","Senator Kelly", "Sentinel", "Sentinels", "Sentry (Robert Reynolds)", "Ser Duncan","Serpent Society","Sersi",
    "Shadow King", "Shadow King (Age of Apocalypse)","Shadowcat","Warpath","Warren Worthington III","Warstar",
    "Wasp","Wasp (Ultimate)","Weapon Omega","Weapon X", "Wendell Rand", "Wendell Vaughn", "Wendigo","Werewolf By Night",
    "Whiplash (Mark Scarlotti)", "Whirlwind", "Whistler","White Queen (Adrienne Frost)","White Tiger (Angela Del Toro)",
    "White Tiger (USM)","Whizzer (Stanley Stewart)","Wiccan", "Wild Child","Wild Child (Age of Apocalypse)",
    "Wild Pack","Wildside", "William Stryker","Wilson Fisk","Wind Dancer","Winter Soldier",
    "Captain Midlands","Captain Stacy","Captain Universe","Cardiac", "Caretaker", "Cargill","Carlie Cooper","Carmella Unuscione",
    "Carnage","Carnage (Ultimate)","Carol Danvers","Carol Hines","Cassandra Nova", "Catseye", "Cecilia Reyes", "Celestials","Centennial",
    "Centurions","Cerebro", "Cerise", "Chamber", "Chameleon", "Champions", "Changeling", "Charles Xavier", "Charlie Campion",
    "Chase Stein", "Chat", "Chimera", "Ch'od",  "Blackheart","Blacklash","Blackout","Blade","Blastaar", "Blazing Skull","Blindfold",
    "Blink", "Blizzard","Blob", "Blob (Ultimate)","Blockbuster", "Blok","Bloke", "Blonde Phantom", "Bloodaxe","Bloodscream",
    "Bloodstorm","Bloodstrike","Blue Blade","Blue Marvel", "Blue Shield", "Blur", "Bob, Agent of Hydra", "Boom Boom",
    "Boomer", "Boomerang","Box","Bride of Nine Spiders (Immortal Weapons)", "Bromley",  "Brood", "Brother Voodoo",
    "Brotherhood of Evil Mutants",
  ];

  //Array option
  arrayOfOptions: Array<any> = [
    { name: '⭕', value: '⭕', disable: false },
    { name: '❌', value: '❌', disable: false },
    { name: '💣', value: '💣', disable: false },
    { name: '⚓', value: '⚓', disable: false },
    { name: '💥', value: '💥', disable: false },
    { name: '🔥', value: '🔥', disable: false },
    { name: '🛫', value: '🛫', disable: false }
  ];

  //Arrays of options for each player
  firstPlayerOptions: Array<any> = [
    { name: '⭕', value: '⭕', disable: false },
    { name: '💣', value: '💣', disable: false },
    { name: '💥', value: '💥', disable: false },
  ]

  secondPlayerOptions: Array<any> = [
    { name: '❌', value: '❌', disable: false },
    { name: '⚓', value: '⚓', disable: false },
    { name: '🔥', value: '🔥', disable: false },
  ]


  //logged in user's data = obj, guest = undefined
  userData: any;

  //array of players in the room
  players = [];

  //players' card options visibility
  firstPlayerOptionsVisible: boolean = true;
  secondPlayerOptionsVisible: boolean = true;
  thirdPlayerOptionsVisible: boolean = true;

  //ready btn is active, right after a symbol's have been chosed
  firstPlayerReadyBtnIsInactive: boolean = true;
  secondPlayerReadyBtnIsInactive: boolean = true;
  thirdPlayerReadyBtnIsInactive: boolean = true;

  //each player ready status visibility
  firstPlayerIsReady: boolean = false;
  secondPlayerIsReady: boolean = false;
  thirdPlayerIsReady: boolean = false;

  //each player icon, to show in card
  firstPlayerIcon: string;
  secondPlayerIcon: string;
  thirdPlayerIcon: string;

  //counter, and status for game starts
  startGameCounter: number = 5;
  gameStarts: boolean = false;

  //firestore room ID
  roomId: string;
  //default settings for player 
  defaultSettings: any = {
    username: "",
    symbol: "",
    inTheRoom: false,
    ready: false,
    leftTheGame: false,
  }


  //each player
  firstPlayer: any = {
    username: "not a player",
    symbol: ""
  };

  secondPlayer: any = {
    username: "not a player",
    symbol: ""
  };

  thirdPlayer: any = {
    username: "",
    symbol: ""
  };

  constructor(
    private mapSizeService: MapSizeService,
    private router: Router,
    private firebaseService: FirebaseService,
    private firestore: AngularFirestore
  ) {
    //get the chosen room data
    this.mapSizeService.roomData.subscribe(
      (roomObj) => {
        this.roomData = roomObj;
      },
      (err) => { console.log(err) }
    )


    //get user data
    this.mapSizeService.loggedInUser.subscribe(
      (user) => {
        this.userData = user;
        //---TWO PLAYERS---
        //check users, set them to each side
        this.checkInUsers(this.userData);
      },
      (err) => { console.log(err) },
      () => { }
    );




  }

  ngOnInit(): void {
    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
      console.info("This page is reloaded");
    } else {
      console.info("This page is not reloaded");
    }
  }


  //--------TWO PLAYERS---------
  //check how many users are in the waiting room, set name, etc
  checkInUsers = (user: any) => {
    //set player cards options visibility true by default
    this.firstPlayerOptionsVisible = true;
    this.secondPlayerOptionsVisible = true;

    //set players ready btn to disabled by default 
    this.firstPlayerReadyBtnIsInactive = true;
    this.secondPlayerReadyBtnIsInactive = true;


    //set game start vars to default 
    this.startGameCounter = 5;
    this.gameStarts = false;

    //set player ready visibility, icon visibility to default 
    this.firstPlayerIsReady = false;
    this.secondPlayerIsReady = false;
    this.thirdPlayerIsReady = false;
    this.firstPlayerIcon = "";
    this.secondPlayerIcon = "";
    this.thirdPlayerIcon = "";


    //generate random name for guest user
    if (user === undefined) {
      let randomNum = Math.floor(Math.random() * this.randomNamesForGuests.length);
      //user = this.randomNamesForGuests[randomNum];
      user = {
        username: this.randomNamesForGuests[randomNum],
        chosenSymbol: null,
      }

      this.userData = user;
    }

    localStorage.setItem('username', this.userData.username);


    //get the room
    this.firestore.collection('defaultRooms', ref => ref.where('roomName', '==', this.roomData.roomName))
      .get().subscribe(
        (data: any) => {
          data.forEach((room: any) => {
            this.roomId = room.id;
            //get how many players are in the room
            let localFirstPlayer = room.data().firstPlayer;
            let localSecondPlayer = room.data().secondPlayer;
            //check inTheRoom fields

            //if there's a player already, set the player as second
            if (localFirstPlayer.inTheRoom) {
              localSecondPlayer.inTheRoom = true;
              localSecondPlayer.leftTheGame = false;
              localSecondPlayer.username = this.userData.username;
              this.secondPlayer = localSecondPlayer;

              //options visibility 
              this.firstPlayerOptionsVisible = false;
              this.secondPlayerOptionsVisible = true;



              this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'secondPlayer': localSecondPlayer }, { merge: true })
                .then(() => { })
                .catch(err => console.log(err))

              //if it's a custom room, set players array
              this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'playersInTheRoom': 2 }, { merge: true })
                .then(() => { })
                .catch(err => console.log(err))
            }


            //if there is no first player yet, set the player as first
            if (!localFirstPlayer.inTheRoom) {
              localFirstPlayer.inTheRoom = true;
              localFirstPlayer.leftTheGame = false;
              localFirstPlayer.username = this.userData.username;
              this.firstPlayer = localFirstPlayer;

              //options visibility 
              this.firstPlayerOptionsVisible = true;
              this.secondPlayerOptionsVisible = false;

              this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'firstPlayer': localFirstPlayer }, { merge: true })
                .then(() => { })
                .catch(err => console.log(err))


              //if it's a custom room, set players array
              this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'playersInTheRoom': 1 }, { merge: true })
                .then(() => { })
                .catch(err => console.log(err))
            }


          })
        },
        (err) => { console.log(err) },
        () => { this.readChangesOfRoom() }
      );

  }


  //subscribe to the room's changes (when a player joins, rewrite the name)
  readChangesOfRoom = () => {
    if (this.roomId) {
      this.firestore.collection('defaultRooms').doc(this.roomId).valueChanges().subscribe(
        (roomData: any) => {
          //set players 
          if (roomData.firstPlayer.inTheRoom) {
            this.firstPlayer = roomData.firstPlayer;
            this.firstPlayerIsReady = this.firstPlayer.ready;
            this.firstPlayerIcon = this.firstPlayer.symbol;

          } else {
            //if inTheRoom is false, then set player options to default
            this.firstPlayer = this.defaultSettings;
            this.firstPlayerIsReady = false;
            this.firstPlayerIcon = "";
          }

          if (roomData.secondPlayer.inTheRoom) {
            this.secondPlayer = roomData.secondPlayer;
            this.secondPlayerIsReady = this.secondPlayer.ready;
            this.secondPlayerIcon = this.secondPlayer.symbol;
          } else {
            //if inTheRoom is false, then set player options to default
            this.secondPlayer = this.defaultSettings;
            this.secondPlayerIsReady = false;
            this.secondPlayerIcon = "";
          }
        },
        (err) => { console.log(err) },
        () => { }
      );

    }
  }

  //check ready status, if both of them are ready, start game in 5 seconds
  getReady = (num: number) => {
    //num = which player pressed ready btn

    if (num === 1) {
      //set first player's ready status to true
      this.firstPlayer.ready = true;
      this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'firstPlayer': this.firstPlayer }, { merge: true })
        .then(() => { })
        .catch(err => console.log(err))
    }

    if (num === 2) {
      //set second player's ready status to true
      this.secondPlayer.ready = true;
      this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'secondPlayer': this.secondPlayer }, { merge: true })
        .then(() => { })
        .catch(err => console.log(err))
    }


    const subs = this.firestore.collection('defaultRooms').doc(this.roomId).valueChanges().subscribe(
      (roomData: any) => {
        let firstPlayer = roomData.firstPlayer;
        let secondPlayer = roomData.secondPlayer;

        if (firstPlayer.ready && secondPlayer.ready) {
          this.startPlay();
          subs.unsubscribe();
        }
      },
      (err) => { console.log(err) },
      () => { }
    );





  }



  selectedIcon = (icon: string, numOfPlayer: string) => {

    //this.userData.chosenSymbol = icon;
    if (numOfPlayer === 'first') {
      this.firstPlayer.symbol = icon;

      //save chosen symbol to firebase 
      this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'firstPlayer': this.firstPlayer }, { merge: true })
        .then(() => { this.firstPlayerReadyBtnIsInactive = false })
        .catch(err => console.log(err))
    }

    if (numOfPlayer === 'second') {
      this.secondPlayer.symbol = icon;

      //save chosen symbol to firebase 
      this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'secondPlayer': this.secondPlayer }, { merge: true })
        .then(() => { this.secondPlayerReadyBtnIsInactive = false })
        .catch(err => console.log(err))
    }


  }



  //leave room, delete the player from the room's player array 
  leaveRoom = (player: string) => {
    //if it's a custom room get the number of players and decrease it by 1
    let numOfPlayers: number;
    //get room data
    this.firestore.collection('defaultRooms').doc(this.roomId).get().subscribe(
      (room: any) => {
        if (room.data().type = "custom") {
          numOfPlayers = room.data().playersInTheRoom;
          numOfPlayers -= 1;
        }
      },
      (err) => { console.log(err) },
      () => { }
    );

    localStorage.removeItem('username');
    if (player === "firstPlayer") {
      this.firestore.collection('defaultRooms')
        .doc(this.roomId).set({ 'firstPlayer': this.defaultSettings }, { merge: true })
        .then(() => {
          this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'playersInTheRoom': numOfPlayers }, { merge: true })
        })
        .then(() => { this.router.navigate(['/rooms']) })
        .then(() => location.reload())
        .catch(err => console.log(err))
    }

    if (player === "secondPlayer") {
      this.firestore.collection('defaultRooms')
        .doc(this.roomId).set({ 'secondPlayer': this.defaultSettings }, { merge: true })
        .then(() => {
          this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'playersInTheRoom': numOfPlayers }, { merge: true })
        })
        .then(() => { this.router.navigate(['/rooms']) })
        .then(() => location.reload())
        .catch(err => console.log(err))
    }

  }


  startPlay() {
    const testObj = {
      map: 'medium',
      numberOfPlayers: 2,
      firstPlayerName: 'Sanyi',
      firstPalyerselectedIcon: '⭕',
      secondPlayerName: 'Tibike',
      secondPalyerselectedIcon: '💣',
      thirdPlayerName: 'Mesike',
      thirdPalyerselectedIcon: '🔥',
    }



    const gameObj = {
      map: this.roomData.boardSize,
      type: this.roomData.type,
      numberOfPlayers: 2,
      firstPlayerName: this.firstPlayer.username,
      firstPalyerselectedIcon: this.firstPlayer.symbol,
      secondPlayerName: this.secondPlayer.username,
      secondPalyerselectedIcon: this.secondPlayer.symbol,
      thirdPlayerName: '',
      thirdPalyerselectedIcon: '',
      roomId: this.roomId
    }



    setTimeout(() => {
      //counter for game start is visible
      this.gameStarts = true;
      //reset detectedReload
      this.firestore.collection('defaultRooms').doc(this.roomId).set({ 'detectedReload': false }, { merge: true });
      this.mapSizeService.leftTheGame.next(false);

    }, 1000)

    setTimeout(() => {
      this.startGameCounter = 4
    }, 2000)

    setTimeout(() => {
      this.startGameCounter = 3
    }, 3000)


    setTimeout(() => {
      this.startGameCounter = 2
    }, 4000)

    setTimeout(() => {
      this.startGameCounter = 1
    }, 5000)

    setTimeout(() => {
      this.mapSizeService.mapSize.next(gameObj);
      this.router.navigate(['/game'])
    }, 6000)


  }






  ngOnDestroy(): void {
    
  }


}
