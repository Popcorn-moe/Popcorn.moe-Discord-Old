export class Handler
{
    constructor(app, name, channels = [null], priority = HandlerPriority.NORMAL)
    {
        this.app      = app;
        this.name     = name;
        this.channels = channels;
        this.priority = priority;
    }

    // Returns: boolean - message consumed
    handleEvent(event, obj)
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
