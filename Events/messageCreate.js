
module.exports = async (client, message) => {
    if (message.author.bot) return;

    const isCommand = message.content.charAt(0) == config.prefix ? true : false;
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command);
    if (!cmd) return;
    cmd.run(client, message, args);
};