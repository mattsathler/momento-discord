export class MomentoServer {
    public id: String;
    public profilesChannelId: String;
    public askProfileChannelId: String;
    public uploaderChannelId: String;
    public trendsChannelId: String;
    public groupsCategoryId: String;
    public chatsChannelsId: [String];
    public verifiedCategoryId: String;
    public sharedTrendWebhooks: [String];
    public momentoVersion: Number;

    public likesToTrend: number;
    public momentosToVerify: number;
    public followersToVerify: number;
    public trendsToVerify: number;
    public momentosTimeout: number;

    public profilesCreated: number;
    public profilesTotalCreated: number;
    public subscriptionDay: Date;
    public subscriptionType: number;
    public clientMessageId: number;

    constructor(id: String, profilesChannelId: String, askProfileChannelId: String, uploaderChannelId: String,
        trendsChannelId: String, chatsChannelsId: [String], groupsCategoryId: String, verifiedCategoryId: String, momentoVersion: Number,
        likesToTrend: number, sharedTrendWebhooks: [String], momentosToVerify: number, followersToVerify: number, trendsToVerify: number, momentosTimeout: number,
        profilesCreated: number, profilesTotalCreated: number, subscriptionDay: Date, subscriptionType: number, clientMessageId: number,

        ) {
        this.id = id
        this.profilesChannelId = profilesChannelId
        this.askProfileChannelId = askProfileChannelId
        this.uploaderChannelId = uploaderChannelId
        this.trendsChannelId = trendsChannelId
        this.chatsChannelsId = chatsChannelsId
        this.groupsCategoryId = groupsCategoryId
        this.verifiedCategoryId = verifiedCategoryId
        this.sharedTrendWebhooks = sharedTrendWebhooks
        this.momentoVersion = momentoVersion
        this.momentoVersion = momentoVersion
        this.likesToTrend = likesToTrend
        this.momentosToVerify = momentosToVerify
        this.followersToVerify = followersToVerify
        this.trendsToVerify = trendsToVerify
        this.momentosTimeout = momentosTimeout

        this.profilesCreated = profilesCreated
        this.profilesTotalCreated = profilesTotalCreated
        this.subscriptionDay = subscriptionDay
        this.subscriptionType = subscriptionType
        this.clientMessageId = clientMessageId
    }
}