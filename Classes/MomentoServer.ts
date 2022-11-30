export class MomentoServer {
    public id: String;
    public profilesChannelId: String;
    public askProfileChannelId: String;
    public uploaderChannelId: String;
    public feedChannelId: String;

    constructor(id: String, profilesChannelId: String, askProfileChannelId: String, uploaderChannelId: String, feedChannelId: String) {
        this.id = id
        this.profilesChannelId = profilesChannelId
        this.askProfileChannelId = askProfileChannelId
        this.uploaderChannelId = uploaderChannelId
        this.feedChannelId = feedChannelId
    }
}