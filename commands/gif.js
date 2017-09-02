import discord from 'discord.js';
import { Category, SimpleCommand } from './index';
import * as utils from '../utils';
import * as embeds from '../embeds';

const gifCategory = new Category('Commandes de GIF', 'Commandes basées sur l\'envoi de gif');

class GifCommand extends SimpleCommand
{
    constructor(app, what)
    {
        super(
            app,
            what,
            '',
            [],
            `[user]`
        );
        this.category = gifCategory;
    }

    execute(message, args)
    {
        message.delete();

        if (args.length < 1)
        {
            this.response(message, this.app.client.user, message.author);
            return;
        }

        const user = utils.asUser(message, args[0]);
        if (user)
        {
            this.response(message, message.author, user);
        }
        else
        {
            this.error(message)
        }
    }

    response(message, from, to)
    {
        const embed = new discord.RichEmbed()
            .setTitle(this.msg(from.username, to.username))
            .setColor(0x00AE86)
            .setImage(utils.randIn(settings[this.name].gifs));

        message.channel.send({ embed });
    }

    error(message, err)
    {
        const embed = embeds.error(this.app)
            .setTitle('Aucun utilisateur trouvé 😭');

        message.channel.send({ embed })
            .then(message => embeds.timeDelete(message));
    }

    get desc() { return settings[this.name].desc; }

    set desc(desc) {}

    msg(first, second)
    {
        return settings[this.name].msg
            .replace('{0}', first)
            .replace('{1}', second);
    }
}

let settings;

export function register(app, registerOne)
{
    utils.loadJson(__dirname + '/gif.json').then(
        json =>
        {
            settings = json;

            Object.keys(settings).forEach(
                name => registerOne(new GifCommand(app, name))
            );
        }
    );
}

