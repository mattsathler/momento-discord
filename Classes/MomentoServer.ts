export class MomentoServer {
    public id: String;
    public profilesChannelId: String;
    public askProfileChannelId: String;
    public uploaderChannelId: String;
    public trendsChannelId: String;

    constructor(id: String, profilesChannelId: String, askProfileChannelId: String, uploaderChannelId: String, trendsChannelId: String) {
        this.id = id
        this.profilesChannelId = profilesChannelId
        this.askProfileChannelId = askProfileChannelId
        this.uploaderChannelId = uploaderChannelId
        this.trendsChannelId = trendsChannelId
    }
}