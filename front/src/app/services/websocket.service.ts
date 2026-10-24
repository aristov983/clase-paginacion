import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { NOTIFICATION_TYPES } from '../model/notifications';
import { NotificationService } from '../shared/services/notification.service';
@Service()
export class WebsocketService {
  _ws?: WebSocket;
  _notificationService = inject(NotificationService);

  connect() {
    const ws = new WebSocket(environment.wsUrl);
    this._ws = ws;

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      const msg = data.msg;
      console.log({ msg });

      if (msg === 'Nuevo usuario creado') {
        this._notificationService.addNotification(NOTIFICATION_TYPES.INFO, 'Nuevo usuario creado!');
      }
    });
  }
}
