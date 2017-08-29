import discord from 'discord.js';
import { RootCommand } from './commands/root';
import fs from 'fs';

class App
{
    constructor(client, settings)
    {
        this.settings        = settings;
        this.client          = client;
        this.guild           = getByID(this.client.guilds, settings.guild); // Popcorn.moe :)
        this.botsChannel     = getByID(this.guild.channels, settings.channel.bots); // #bots
        this.allowedChannels = settings.allowedChannels.map(channel => getByID(this.guild.channels, channel));
        this.rootCommand     = new RootCommand(this);
    }

    init()
    {
        this.client.on('message', msg =>
        {
            console.log(msg.content);
            if (msg.content.startsWith(this.settings.prefix) && !msg.content.startsWith(this.settings.prefix + this.settings.prefix))
            {
                console.log(msg.content);
                this.rootCommand.handleCommand(msg, msg.content.slice(1).split(' '), 0);
            }
        });
    }
}

function getByID(smth, id)
{
    return smth.array()
        .find(o => o.id == id); // #bots
}


const client = new discord.Client();

client.on('ready', () =>
{
    fs.readFile(__dirname + '/settings.json',
        (err, data) =>
        {
            if (err) throw err;

            console.log('Settings loaded');

            new App(client, JSON.parse(data)).init();
        });

    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.POPCORN_MOE_DISCORD_TOKEN);