import { Category, SimpleCommand } from './index';

const testCategory = new Category('Test', 'Commandes qui seront supprimées à terme.');

class EchoCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'echo',
            'Send a message. Simple, huh?',
            ['ping'],
            `{msg}`
        );
        this.category = testCategory;
    }

    execute(message, args, usageError)
    {
        if (args.length < 1)
        {
            usageError();
            return;
        }

        message.delete();
        message.channel.send('```\n' + message.content + '\n```');
    }
}

export function register(app, registerOne)
{
    registerOne(new EchoCommand(app));
}