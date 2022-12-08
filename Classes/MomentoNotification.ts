import { MomentoUser } from "./MomentoUser"

export class MomentoNotification {
    public notifiedUser: MomentoUser
    public notificatorUser: MomentoUser
    public timestamp: Date
    public text: String
    public thumbnailURL: String
    public url: String

    constructor(notifiedUser: MomentoUser, notificatorUser: MomentoUser, timestamp: Date, text: String, thumbnailURL?: String, url?: String) {
        this.notificatorUser = notificatorUser
        this.notifiedUser = notifiedUser
        this.timestamp = timestamp
        this.text = text
        if (thumbnailURL) { this.thumbnailURL = thumbnailURL }
        if (url) {this.url = url}
    }
}