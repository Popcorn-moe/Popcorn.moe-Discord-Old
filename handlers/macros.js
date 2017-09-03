import { Handler, HandlerPriority } from './index';
import * as utils from '../utils';

class MacroHandler extends Handler
{
    constructor(app)
    {
        super(app, 'Macro', app.guild.channels.array(), HandlerPriority.LOW);
    }

    handleEvent(event, message)
    {
        if (event !== 'message') return false;

        const msg   = message.content.toLowerCase();
        const macro = settings[msg];

        if (!macro) return false;

        message.delete();

        switch (macro.type)
        {
            case 'message':
                message.reply(macro.content);
                break;
        }

        const lastConn    = this.app.client.voiceConnections.first();
        const lastChannel = lastConn && lastConn.channel;
        const channel     = macro.audio && message.member.voiceChannel;
        if (channel)
        {
            this.app.voiceManager.connectionFor(channel)
                .then(connection => connection.playFile(macro.audio)
                    .on('end', reason =>
                        {
                            if (lastChannel)
                            {
                                lastChannel.join()
                                    .then(connection => this.app.voiceManager.connect(connection))
                                    .catch(err => {/* do nothing */});
                            }
                            else
                            {
                                connection.disconnect();
                            }
                        }
                    )
                )
                .catch(err => {/* do nothing */});
        }

        return true;
    }
}

let settings;

export function register(app, registerOne)
{
    utils.loadJson(__dirname + '/macros.json').then(
        json =>
        {
            settings = json;
            registerOne(new MacroHandler(app));
        }
    );
}
