import { HttpErrorResponse } from '@angular/common/http';
import { Service, signal } from '@angular/core';
import { Notification, NOTIFICATION_TYPES } from '../../model/notifications';

@Service()
export class NotificationService {
    private _notifications = signal<Notification[]>([])

    public notifications = this._notifications.asReadonly()

    public addNotification(noti_type: NOTIFICATION_TYPES, msg: string) {
        this._notifications.update((n) => [...n, { noti_type: noti_type, message: msg }])
    }

    public cleanNotifications() {
        this._notifications.set([])
    }

    public delNotification(noti_idx: number) {
        this._notifications.update(n => n.filter((_, i) => i !== noti_idx))
    }

    public addErrorFromError(error: Error): void {
        if (error instanceof HttpErrorResponse) {
            //Error de HttpClient
            this.addNotification(NOTIFICATION_TYPES.ERROR, error.error.message);
            return;
        }
        this.addNotification(NOTIFICATION_TYPES.ERROR, error.message);
    }
}
