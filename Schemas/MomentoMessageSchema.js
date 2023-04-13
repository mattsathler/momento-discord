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
    'type': reqString,
    'messageId': reqString,
    'channelId': reqString,
    'guildId': reqString,
    'authorProfileChannelId': reqString,
    'content': reqString,
    'timestamp': {
        type: Date,
        required: true,
        default: false
    }
})

module.exports = mongo.model('message', schema)