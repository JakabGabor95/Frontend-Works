import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { LoginComponent } from './login/login.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { RoomsComponent } from './rooms/rooms.component';
import { WaitingRoomComponent } from './waiting-room/waiting-room.component';

const routes: Routes = [
  {path: "", component: LoginComponent},
  {path: "login", component: LoginComponent},
  {path: "rooms", component: RoomsComponent},
  {path: "game", component: GameComponent},
  {path: "waitingroom", component: WaitingRoomComponent},
  {path: "**", component: PagenotfoundComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
