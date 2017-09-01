import * as command from './command';

const handlers = [command];

export class Handlers
{
    constructor(app)
    {
        this.app      = app;
        this.handlers = [];

        const registerer = handler => this.registerHandler(handler, this);
        handlers.forEach(file => file.register(app, registerer));
    }

    registerHandler(handler, self = this)
    {
        console.log(`Registering message handler '${handler.name}'.`);
        self.handlers.push(handler);
    }

    dispatch(message)
    {
        if (message.guild !== this.app.guild) return;

        const handlers = this.handlers.sort((f, s) => f.priority > s.priority);

        for (const handler of handlers)
        {
            if (handler.handleMessage(message)) return;
        }

        this.handlers.forEach(h => h.monitor(message));
    }
}