import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators, AbstractControl, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../service/firebase.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // DISPLAY MODAL
  showSignInModal: boolean = true;
  showRegModal: boolean = false;

  // FORMS
  regForm: FormGroup;
  loginForm: FormGroup;


  // SIGNIN
  isSignedIn: boolean = false;

  //EMAIL IS ALREADY TAKEN
  emailIsAlreadyTaken:boolean = false;

  //USERNAME IS ALREADY TAKEN
  usernameIsAlreadyTaken:boolean = false;

  //ERRORS
  wrongPassword:boolean = false;

  constructor(
    private router: Router,
    public firebaseAuth: AngularFireAuth,
    private firebaseService: FirebaseService,
    private db: AngularFirestore,
    private formBuilder: FormBuilder) {

    // REGISTER FORM  
    this.regForm = this.formBuilder.group({
      username: new FormControl("", [Validators.required, Validators.minLength(5), Validators.maxLength(30), Validators.pattern(/^[a-zéáűúőóüöíA-ZÉÁŰÚŐÓÜÖÍ0-9 ]+$/), this.userNameAlreadyTaken(this.db)]),
      email: new FormControl("", [Validators.required, Validators.pattern(/^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?/), this.emailAlreadyTaken(this.db)]),
      password: new FormControl("", [Validators.required, Validators.pattern(/^[a-zéáűőúóíüöA-ZÉÁŰÚŐÍÖÜÓ0-9!?]{6,}$/)]),
      repassword: new FormControl("", Validators.required)

    })

    // LOGIN FORM
    this.loginForm = new FormGroup({
      email: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required)
    })
  }


  ngOnInit(): void {
    this.checkLocalStorage();
  }




  // CHECK LOCALSTORAGE
  checkLocalStorage() {
    if (this.firebaseService.getLocalStorageDetails() !== null) {
      this.isSignedIn = true;
    } else {
      this.isSignedIn = false;
    }
  }

  //SIGN UP
  async onSignup() {
    let userObject: any = this.regForm.value;
    await this.firebaseService.signup(userObject);
    if (this.firebaseService.isLoggedIn) {
      this.isSignedIn = true;
      this.regForm.reset();
    }
  }

  //SIGN IN
  async onSignin() {
    let userObject: any = this.loginForm.value;
    await this.firebaseService.signin(userObject);
    if (this.firebaseService.isLoggedIn) {
      this.isSignedIn = true;
      this.wrongPassword = false;
      this.regForm.reset();
    }else {
      this.wrongPassword = true;
    }
  }

  // EMAIL ALREADY TAKEN
  emailAlreadyTaken(db: AngularFirestore) {
    return (control: AbstractControl) => {
      const emailInput = control.value;
      let result;
      let user = db.collection('users', ref => ref.where('email', '==', emailInput));
      user.get().subscribe(
        (users) => {
          this.emailIsAlreadyTaken = false;
          users.forEach((user: any) => {
            this.emailIsAlreadyTaken = true;
          })
        },
        (err) => { console.log(err) }
      )
      return result
    }
  }


  userNameAlreadyTaken(db:AngularFirestore) {
    return (control: AbstractControl) => {
      const usernameInput = control.value;
      let result;
      let user = db.collection('users', ref => ref.where('username', '==', usernameInput));
      user.get().subscribe(
        (users) => {
          this.usernameIsAlreadyTaken = false;
          users.forEach((user: any) => {
            this.usernameIsAlreadyTaken = true;
          })
        },
        (err) => { console.log(err) }
      )
      return result
    }
  }

  // DISPLAY MODAL
  signInModal() {
    this.showSignInModal = true;
    this.showRegModal = false;
  }

  signUpModal() {
    this.showRegModal = true;
    this.showSignInModal = false;
  }

  // PLAY AS GUEST
  playAsGuest() {
    
    this.router.navigate(['/rooms'])
  }




}


