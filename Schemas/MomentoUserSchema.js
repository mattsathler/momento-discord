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
        default: 'https://discord.com/channels/1084823963974246414/1210763625250291772/1210778080940138528'
    },
    'profileCover': {
        type: String,
        required: true,
        default: 'https://discord.com/channels/1084823963974246414/1210763625250291772/1210778701990727710'
    },
    'collage': {
        type: [String],
        blackbox: true,
        default: [
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210772888463081493',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210772888463081493',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210772888463081493',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210772888463081493',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210772888463081493',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210772888463081493',
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
    'groupChatId': {
        type: String,
        default: ""
    },
    'isVerified': {
        type: Boolean,
        default: false
    },
    'theme': {
        'type': {
            'primary': String,
            'secondary': String,
            'tertiary': String,
        },
        default: {
            primary: "000000",
            secondary: "B3B3B3",
            tertiary: "FFFFFF",
        }
    }
})

module.exports = mongo.model('users', schema)