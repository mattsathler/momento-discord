const mongo = require('mongoose');
require('mongoose-long')(mongo);
var Long = mongo.Schema.Types.Long;

const reqString = {
    type: String,
    required: true
}

const schema = new mongo.Schema({
    'id': {
        type: String,
        required: true,
    },
    'username': reqString,
    'name': {
        type: String,
        default: 'Momento',
        required: true
    },
    'surname': {
        type: String,
        default: 'User',
        required: true,
    },
    'guildId': reqString,
    'profileChannelId': { type: String },
    'profileMessageId': { type: String },
    'profileCollageId': { type: String },
    'profileCollageStyle': {
        type: Number,
        required: true,
        default: 0
    },
    'profilePicture': {
        type: String,
        required: true,
        default: 'https://imgur.com/ax98YzW.png'
    },
    'profileCover': {
        type: String,
        required: true,
        default: 'https://imgur.com/qb2S2mU.png'
    },
    'collage': {
        type: [String],
        blackbox: true,
        default: [
            'https://imgur.com/fbiUIMs.png',
            'https://imgur.com/fbiUIMs.png',
            'https://imgur.com/fbiUIMs.png',
            'https://imgur.com/fbiUIMs.png',
            'https://imgur.com/fbiUIMs.png',
            'https://imgur.com/fbiUIMs.png',
        ],
        required: true
    },
    'bio': {
        type: String,
        required: true,
        default: 'O seu momento!'
    },
    'trends': {
        type: Long,
        required: true,
        default: 0
    },
    'followers': {
        type: Long,
        required: true,
        default: 1
    },
    'momentos': {
        type: Long,
        required: true,
        default: 0
    },
    'notifications': {
        type: Boolean,
        default: true
    },
    'darkmode': {
        type: Boolean,
        default: false
    },
    'groupChatId': {
        type: String,
        default: ""
    },
    'isVerified': {
        type: Boolean,
        default: false
    },
})

module.exports = mongo.model('users', schema)