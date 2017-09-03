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

        const lastChannel = this.app.client.voiceConnections.first().channel;
        const channel     = macro.audio && message.member.voiceChannel;
        if (channel)
        {
            this.app.voiceManager.connectionFor(channel)
                .then(connection =>
                      {
                          const handler = connection.playFile(macro.audio);
                          if (lastChannel)
                          {
                              handler.on('end', reason => lastChannel.join()
                                  .then(connection => this.app.voiceManager.connect(connection))
                                  .catch(err => {/* do nothing */})
                              );
                          }
                      }
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
