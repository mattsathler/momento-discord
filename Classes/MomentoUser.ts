export class MomentoUser {
    public id: String;
    public username: String;
    public name: String;
    public surname: String;
    public guildId: String;
    public profileChannelId: String;
    public profileMessageId: String;
    public profilePicture: String;
    public profileCover: String;
    public collage: String[];
    public bio: String;
    public trends: Number;
    public followers: Number;
    public momentos: Number;
    public notifications: Boolean;

    constructor(id: String, username: String, name: String, surname: String, guildId: String, profileChannelId: String,
        profileMessageId: String, profilePicture: String, profileCover: String, collage: String[],
        bio: String, trends: Number, followers: Number, momentos: Number, notifications: Boolean) {
        this.id = id
        this.username = username
        this.name = name
        this.surname = surname
        this.guildId = guildId
        this.profileChannelId = profileChannelId
        this.profileMessageId = profileMessageId
        this.profilePicture = profilePicture
        this.profileCover = profileCover
        this.collage = collage
        this.bio = bio
        this.trends = trends
        this.followers = followers
        this.momentos = momentos
        this.notifications = notifications
    };
}