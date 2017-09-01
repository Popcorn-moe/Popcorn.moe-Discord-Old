import { HandlerPriority, MessageHandler } from './index';

class CommandHandler extends MessageHandler
{
    constructor(app)
    {
        super(app, 'Command', app.allowedChannels, HandlerPriority.NORMAL);
    }

    handleMessage(message)
    {
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
