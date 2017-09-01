import { Handler, HandlerPriority } from './index';

class CommandHandler extends Handler
{
    constructor(app)
    {
        super(app, 'Command', app.guild.channels.array(), HandlerPriority.NORMAL);
    }

    handleEvent(event, message)
    {
        if (event !== 'message') return;

        if (message.content.startsWith(this.app.settings.prefix))
        {
            this.app.rootCommand.handleCommand(message, message.content.slice(1).split(' '), 0);
            return true;
        }

        return false;
    }
}

export function register(app, registerOne)
{
    registerOne(new CommandHandler(app));
}
