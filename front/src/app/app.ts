import { Component, effect, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AuthService } from './services/auth.service';
import { WebsocketService } from './services/websocket.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  //NADA POR AQUI TODAVÍA
  public authService = inject(AuthService);

  private _wsService = inject(WebsocketService);

  ngOnInit(): void {
    this._wsService.connect();
  }
}
