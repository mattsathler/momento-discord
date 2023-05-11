const mongo = require('mongoose');
require('mongoose-long')(mongo);

const reqString = {
    type: String,
    required: true
}

const schema = new mongo.Schema({
    'id': {
        type: String,
        required: true,
        unique: true
    },
    'isActive': {
        type: Boolean,
        required: true,
        default: true,
    },
    'paymentDate': {
        type: Date,
        required: true,
        default: Date.now()
    },
    'uploaderChannelId': reqString,
    'askProfileChannelId': reqString,
    'verifiedCategoryId': reqString,
    'profilesChannelId': reqString,
    'trendsChannelId': reqString,
    'groupsCategoryId': reqString,
    'chatsChannelsId': {
        type: [String],
        blackbox: true,
        default: []
    },
    'likesToTrend': {
        type: Number,
        required: true,
        default: 20,
    },
    'momentosToVerify': {
        type: Number,
        required: true,
        default: 40,
    },
    'followersToVerify': {
        type: Number,
        required: true,
        default: 2000,
    },
    'trendsToVerify': {
        type: Number,
        required: true,
        default: 20,
    },
    'momentosTimeout': {
        type: Number,
        required: true,
        default: 24,
    },
    'profilesCreated': {
        type: Number,
        required: true,
        default: 0
    },
    'profilesTotalCreated': {
        type: Number,
        required: true,
        default: 0
    },
    'subscriptionDay': {
        type: Date,
        required: true,
        default: Date.now()
    },
    'subscriptionType': {
        type: Number,
        required: true,
        default: 25
    },
    'clientMessageId': {
        type: String,
        required: false,
    },
    'momentoVersion': Number,
})

module.exports = mongo.model('servers', schema)