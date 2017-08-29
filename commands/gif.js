import discord from 'discord.js';
import { Category, SimpleCommand } from './index';
import * as utils from '../utils';

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

        utils.asUser(message, args[0])
            .then(user => this.response(message, message.author, user))
            .catch(err => this.error(message, err));
    }

    response(message, from, to)
    {
        const embed = new discord.RichEmbed()
            .setTitle(this.msg(from.username, to.username))
            .setColor(0x00AE86)
            .setImage(randGif(this.name));

        message.channel.send({ embed });
    }

    error(message, err)
    {
        const embed = new discord.RichEmbed()
            .setTitle(err)
            .setColor(0xdb1348)
            .setImage(this.app.settings.images.error);

        message.channel.send({ embed });
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

function randGif(what)
{
    const rand = Math.floor(Math.random() * Object.keys(settings[what].gifs).length);
    console.log(rand);
    return settings[what].gifs[rand];
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

