import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FirebaseService } from '../service/firebase.service';
import { MapSizeService } from '../service/map-size.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  isSignedIn: boolean = false;

  //leave game only visible when u're in the game component
  isInTheGame:boolean = false;

  constructor(public firebaseService: FirebaseService, private mapService: MapSizeService) { }

  ngOnInit(): void {

    this.checkLocalStorage();

    this.mapService.inTheGame.subscribe(
      (status:boolean) => {
        this.isInTheGame = status;
      },
      (err) => {console.log(err)}
    );
  }

  // CHECK LOCALSTORAGE
  checkLocalStorage() {
    if (this.firebaseService.getLocalStorageDetails() !== null) {
      this.isSignedIn = true;
    } else {
      this.isSignedIn = false;
    }
  }

  //LOGOUT
  logout() {
    this.firebaseService.logout()
  }

  leaveGame = () => {
    this.mapService.leftTheGame.next(true);
  }



}


