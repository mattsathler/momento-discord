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
    'profilesChannelId': reqString,
    'trendsChannelId': reqString,
    'chatChannelId': reqString
})

module.exports = mongo.model('servers', schema)