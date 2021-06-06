import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
/* import { EncrDecrService } from './encr-decr.service'; */

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  // SIGNIN
  isLoggedIn: boolean = false;
  currentUserEmail: string;

  constructor(
    public firebaseAuth: AngularFireAuth,
    private router: Router,
    private db: AngularFirestore/* , 
    private EncrDecr: EncrDecrService */) { }



  // SIGN UP
  async signup(userObject: any) {

    let userToDatabase: any = {
      username: userObject.username,
      email: userObject.email,
      /*  password: this.EncrDecr.set('123456$#@$^@1ERF', userObject.password), */
      chosenSymbol: null
    }
    this.db.collection('users').add(userToDatabase)
      .then(user => console.log(user))
      .catch(err => console.log(err))

    //sign up firebase account
    await this.firebaseAuth
      .createUserWithEmailAndPassword(userObject.email, userObject.password)
      .then(res => {
        this.isLoggedIn = true;
        localStorage.setItem('user', JSON.stringify(res.user.email));
        this.router.navigate(['/rooms']);
        setTimeout(function () { location.reload() }, 0);
      })
  }

  // SIGN IN
  async signin(userObject: any) {
    await this.firebaseAuth.signInWithEmailAndPassword(userObject.email, userObject.password)
      .then(res => {
        this.isLoggedIn = true
        localStorage.setItem('user', JSON.stringify(res.user.email));
        this.router.navigate(['/rooms']);
        setTimeout(function () { location.reload() }, 0);
      })
      .catch(err => console.log(err))
  }


  // LOGOUT
  logout() {
    this.firebaseAuth.signOut();
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
    setTimeout(function () { location.reload() }, 0);
  }


  // CHECK LOCAL STORAGE
  getLocalStorageDetails() {
    if (localStorage.getItem('user') !== null) {
      this.currentUserEmail = JSON.parse(localStorage.getItem('user'));
      return localStorage.getItem('user');
    } else {
      return null
    }
  }


  // GET CURRENT USER
  getCurrentUser(): Observable<any> {
    return this.db.collection('users', ref => ref.where('email', '==', this.currentUserEmail)).get();
  }

  //GET CURRENT ROOM PASSWORD
  getCurrentRoom(roomName:any): Observable<any> {
    return this.db.collection('defaultRooms', ref => ref.where('roomName', '==', roomName)).get();
  }


  // ADD NEW ROOM
  addNewRoom(roomToDatabase:any){
   
    return this.db.collection('defaultRooms').add(roomToDatabase)
    .then(() => {})
    .catch(err => console.log(err))
  }

  // GET ROOMS
  getRooms():Observable<any>{
    return this.db.collection('defaultRooms').get();
  }











}


