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

    public likesToTrend: number;
    public momentosToVerify: number;
    public followersToVerify: number;
    public trendsToVerify: number;
    public momentosTimeout: number;

    constructor(id: String, profilesChannelId: String, askProfileChannelId: String, uploaderChannelId: String,
        trendsChannelId: String, chatsChannelsId: [String], groupsCategoryId: String, verifiedCategoryId: String, momentoVersion: Number,
        likesToTrend: number, momentosToVerify: number, followersToVerify: number, trendsToVerify: number, momentosTimeout: number,
        ) {
        this.id = id
        this.profilesChannelId = profilesChannelId
        this.askProfileChannelId = askProfileChannelId
        this.uploaderChannelId = uploaderChannelId
        this.trendsChannelId = trendsChannelId
        this.chatsChannelsId = chatsChannelsId
        this.groupsCategoryId = groupsCategoryId
        this.verifiedCategoryId = verifiedCategoryId
        this.momentoVersion = momentoVersion
        this.likesToTrend = likesToTrend
        this.momentosToVerify = momentosToVerify
        this.followersToVerify = followersToVerify
        this.trendsToVerify = trendsToVerify
        this.momentosTimeout = momentosTimeout
    }
}