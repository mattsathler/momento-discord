export class ServerConfig {
    public id: String;
    public profilesChannelId: String;
    public askProfileChannelId: String;
    public uploaderChannelId: String;

    constructor(id: String, profilesChannelId: String, askProfileChannelId: String, uploaderChannelId: String) {
        this.id = id
        this.profilesChannelId = profilesChannelId
        this.askProfileChannelId = askProfileChannelId
        this.uploaderChannelId = uploaderChannelId
    }
}