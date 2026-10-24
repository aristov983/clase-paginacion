import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AuthService } from './services/auth.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  //NADA POR AQUI TODAVÍA
  public authService = inject(AuthService);


}
