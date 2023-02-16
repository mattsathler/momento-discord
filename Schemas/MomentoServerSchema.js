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
    }
})

module.exports = mongo.model('servers', schema)