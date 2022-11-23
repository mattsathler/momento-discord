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
        unique: true
    },
    'uploaderChannelId': reqString,
    'askProfileChannelId': reqString,
    'profilesChannelId': reqString
})

module.exports = mongo.model('servers', schema)