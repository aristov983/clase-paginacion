import { Component, computed, inject, signal } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  imports: [],
  selector: 'notifications',
  styleUrl: './notification.component.css',
  templateUrl: './notification.component.html',
})
export class NotificationComponent {
  readonly #notificationService = inject(NotificationService)

  public notifications = this.#notificationService.notifications

  public hayNotificaciones = computed(() => this.notifications().length > 0)

  cleanNoti() {
    this.#notificationService.cleanNotifications()
  }
}
