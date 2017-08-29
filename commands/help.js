import discord from 'discord.js';
import { SimpleCommand } from './index';
import * as utils from '../utils';

const helpDesc    = 'Afficher une page d\'aide à propos d\'une commande';
const helpUsage   = '[commande]';
const helpAliases = ['aide', 'aled'];

class HelpCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'help',
            helpDesc,
            helpAliases,
            helpUsage
        );
        this.category = null; // Hidden category
    }

    execute(message, args)
    {
        console.log(args);
        if (args.length == 0)
        {
            utils.sendAndMention(this.app, wholeHelp(this.app), message.author);
        }
    }
}

function wholeHelp(app)
{
    const embed = new discord.RichEmbed()
        .setTitle(`**__Commandes:__**`)
        .addField(`❓ **\\${app.settings.prefix}help ${helpUsage}** [*alias: ${helpAliases.join(', ')}*]`, // ❓ is an emoji
                  `╰> *${helpDesc}*`); //Hardcode help 'cause why shouldn't I ?

    const allCommands = app.rootCommand.children;
    const categories  = allCategories(allCommands);

    categories.forEach(
        category => // For all categories
        {
            let field = '';

            const commands = allCommands.filter(command => command.category === category);

            for (let i = 0; i < commands.length; i++) // For all all command in category
            {
                const command = commands[i];

                field += '┃\n';

                const last = i === commands.length - 1; // Handle last command differently

                let prefix1 = last ? '┗►' : '┣►';
                let prefix2 = last ? '   ' : '┃ ';

                field += prefix1 + ` **\\${app.settings.prefix}${command.name} ${command.usage}**`
                         + (command.aliases.length > 0 ? ' [*alias: ' + command.aliases.join(', ') + '*]\n' : '\n')
                         + prefix2 + `     ╰> *${command.desc}*\n`;
            }

            embed.addField(`▶ **${category.name}** - ${category.desc}`, // ▶ is an emoji
                           field);
        }
    );

    return embed.setImage(app.settings.images.help)
        .setThumbnail(app.settings.images.iconAnimated)
        .setColor(0x8ed16c)
        .setTimestamp()
        .setFooter('www.popcorn.moe', app.settings.images.siteIcon);
}

function allCategories(commands)
{
    let set = new Set(); // No duplicate

    commands.forEach(command => set.add(command.category));

    set.delete(null); // Remove hidden category

    return set;
}


export function register(app, registerOne)
{
    registerOne(new HelpCommand(app));
}