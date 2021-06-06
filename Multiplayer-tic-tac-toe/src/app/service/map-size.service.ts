import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapSizeService {

  //stores logged in user's data
  loggedInUser = new BehaviorSubject<any>(null);

  roomData = new BehaviorSubject<any>(null);
  mapSize = new BehaviorSubject<any>(null);

  //get true value when entering the game component
  inTheGame = new BehaviorSubject<any>(null);

  //left game status, receive data when somebody left the game
  leftTheGame = new BehaviorSubject<any>(null);

  constructor() { }
}
