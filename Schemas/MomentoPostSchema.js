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
    'messageId': reqString,
    'channelId': reqString,
    'guildId': reqString,
    'authorProfileChannelId': reqString,
    'postDescription': { type: String },
    'postImageUrl': reqString,
    'isTrending': {
        type: Boolean,
        required: true,
        default: false
    },
    'isPublic': {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongo.model('posts', schema)