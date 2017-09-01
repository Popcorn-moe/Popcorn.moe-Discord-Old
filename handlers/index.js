export class MessageHandler
{
    constructor(app, name, channels, priority)
    {
        this.app      = app;
        this.name     = name;
        this.channels = channels;
        this.priority = priority;
    }

    // Returns: boolean - message consumed
    handleMessage(message)
    {
        return false;
    }

    monitor(message) {}
}


export const HandlerPriority = {
    HIGHEST: 5,
    HIGH   : 4,
    NORMAL : 3,
    LOW    : 2,
    LOWEST : 1
};
