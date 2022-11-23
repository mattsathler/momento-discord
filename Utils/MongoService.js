
const mongo = require("mongoose");

exports.getConfigById = async function (serverId) {
    const servers = mongo.model('servers');
    try {
        const serverConfig = await servers.find({ id: serverId })
        return serverConfig[0];
    }
    catch (err) {
        console.error(err)
        return
    }
}