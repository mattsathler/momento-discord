export class MomentoServer {
    public id: String;
    public profilesChannelId: String;
    public askProfileChannelId: String;
    public uploaderChannelId: String;
    public trendsChannelId: String;
    public groupsCategoryId: String;
    public chatsChannelsId: [String];
    public verifiedCategoryId: String;
    public momentoVersion: Number;

    constructor(id: String, profilesChannelId: String, askProfileChannelId: String, uploaderChannelId: String,
        trendsChannelId: String, chatsChannelsId: [String], groupsCategoryId: String, verifiedCategoryId: String, momentoVersion: Number) {
        this.id = id
        this.profilesChannelId = profilesChannelId
        this.askProfileChannelId = askProfileChannelId
        this.uploaderChannelId = uploaderChannelId
        this.trendsChannelId = trendsChannelId
        this.chatsChannelsId = chatsChannelsId
        this.groupsCategoryId = groupsCategoryId
        this.verifiedCategoryId = verifiedCategoryId
        this.momentoVersion = momentoVersion
    }
}