export enum NOTIFICATION_TYPES {
    ERROR = "error",
    WARNING = "warning",
    INFO = "info"
}

export type Notification = {
    noti_type: NOTIFICATION_TYPES,
    message: string
}