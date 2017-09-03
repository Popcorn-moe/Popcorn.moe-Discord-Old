import * as command from './command';
import * as features from './features';
import * as macros from './macros';

const handlers = [command, features, macros];

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
        console.log(`Registering handler '${handler.name}'.`);
        self.handlers.push(handler);
    }

    //Todo find a better way to do this
    init()
    {
        const listen = {
            'message'              : msg => this.dispatchEvent('message',
                                                               msg,
                                                               msg.guild,
                                                               msg.channel),
            'messageReactionAdd'   : (reaction, user) => this.dispatchEvent('messageReactionAdd',
                                                                            { reaction, user },
                                                                            reaction.message.guild,
                                                                            reaction.message.channel),
            'messageReactionRemove': (reaction, user) => this.dispatchEvent('messageReactionRemove',
                                                                            { reaction, user },
                                                                            reaction.message.guild,
                                                                            reaction.message.channel)
        };

        Object.entries(listen).forEach(([event, callback]) => this.app.client.on(event, callback));
    }

    dispatchEvent(event, obj, guild = null, channel = null)
    {
        if (guild && guild !== this.app.guild) return;

        const handlers  = this.handlers.filter(h => h.channels.includes(channel));
        const consumers = handlers.sort((f, s) => f.priority < s.priority);

        for (const handler of consumers)
        {
            if (handler.handleEvent(event, obj)) return;
        }

        handlers.forEach(h => h.monitor(obj));
    }
}