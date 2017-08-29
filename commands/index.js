import discord from 'discord.js';

export class AbstractCommand
{
    constructor(app, name, desc, aliases, usage)
    {
        this.app     = app;
        this.name    = name;
        this.desc    = desc;
        this.aliases = aliases;
        this.usage   = usage;
    }

    handleCommand() {};
}

export class SimpleCommand extends AbstractCommand
{
    constructor(app, name, desc, aliases, usage)
    {
        super(app, name, desc, aliases, usage);
    }

    handleCommand(message, args, depth)
    {
        function usageError()
        {
            const embed = new discord.RichEmbed()
                .setTitle('Moi pas comprendre.')
                .setDescription(this.app.settings.prefix + args.join(' ') + ' ' + this.usage)
                .setColor(0xdb1348)
                .setImage(this.app.settings.images.error);

            message.channel.send({ embed });
        }

        this.execute(message, args.slice(depth), usageError);
    }

    execute(message, args, usageError) {}
}

export class SimpleCompoundCommand extends AbstractCommand
{
    constructor(app, name, desc, aliases, usage, children)
    {
        super(app, name, desc, aliases, usage);

        this.children = [];

        const self     = this;
        const regChild = child => self.registerChild(child, self);

        children.forEach(regChild);
    }

    registerChild(child, self = this) //2nd parameter optional
    {
        self.children.push(child);
    }

    handleCommand(message, args, depth)
    {
        const child = this.findChild(args[depth]);

        if (!child)
        {
            this.notFound(message, args, depth);
            return;
        }

        child.handleCommand(message, args, depth + 1);
    }

    findChild(label)
    {
        return this.children.find(
            child => child.name === label || child.aliases.find(alias => alias == label));
    }

    notFound(message)
    {
        const embed = new discord.RichEmbed()
            .setTitle('Impossible de trouver la commande.')
            .setDescription('Utilisez la commande **`help [commande]** pour obtenir de l\'aide sur une commande')
            .setColor(0xdb1348)
            .setImage(this.app.settings.images.error);

        message.channel.send({ embed });
    }
}

// Only for commands in Root
export class Category
{
    constructor(name, desc)
    {
        this.name = name;
        this.desc = desc;
    }
}
