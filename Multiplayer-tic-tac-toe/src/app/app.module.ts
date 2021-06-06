import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

//Import Components
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RoomsComponent } from './rooms/rooms.component';
import { GameComponent } from './game/game.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { NavComponent } from './nav/nav.component';

//CRYPTO
import { EncrDecrService } from './service/encr-decr.service';

//Import Reactive forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Import Firebase
import { AngularFireModule } from '@angular/fire'
import { AngularFireDatabase, AngularFireDatabaseModule } from '@angular/fire/database'
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment.prod';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { WaitingRoomComponent } from './waiting-room/waiting-room.component'
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RoomsComponent,
    GameComponent,
    PagenotfoundComponent,
    NavComponent,
    WaitingRoomComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), //firebase config
    AngularFireAuthModule, // auth
    AngularFirestoreModule, //adatbázishoz
    SweetAlert2Module
    
    
  ],
  providers: [EncrDecrService],
  bootstrap: [AppComponent]
})
export class AppModule { }
