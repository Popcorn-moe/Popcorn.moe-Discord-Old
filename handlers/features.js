import discord from 'discord.js';
import { Handler, HandlerPriority } from './index';

class FeaturesHandler extends Handler
{
    constructor(app)
    {
        super(app, '#features', [app.featuresChannel], HandlerPriority.HIGH);
        this.channel = app.featuresChannel;

        this.channel.fetchMessages(); //Allow the bot to listen to reactions.
    }

    handleEvent(event, obj)
    {
        switch (event)
        {
            case 'message':
                this.handleMessage(obj);
                break;
            case 'messageReactionAdd':
                const { reaction, user } = obj;
                this.handleReactionAdd(reaction, user);
                break;
        }
        return true;
    }

    handleMessage(message)
    {
        if (message.author === this.app.client.user) return;
        message.delete();
        console.log(message.content);

        const embed = new discord.RichEmbed()
            .setTitle(message.content)
            .setColor(0x8ed16c)
            .setTimestamp()
            .setAuthor(`${message.author.username} <${message.author.id}>`, message.author.avatarURL);

        this.channel.send({ embed })
            .then((message) => message.react('👍')) //Ensure order
            .then((react) => react.message.react('👎'))
            .then((react) => react.message.react('❌'));
    }

    handleReactionAdd(reaction, user)
    {
        const embed = reaction.message.embeds[0];
        const id    = /^.+ <(\d+)>/g.exec(embed.author.name)[1]; //Get id in name
        if (reaction.emoji.name === '❌' && id === user.id)
        {
            reaction.message.delete();
        }
    }
}

export function register(app, registerOne)
{
    registerOne(new FeaturesHandler(app));
}
