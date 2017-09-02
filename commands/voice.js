import { Category, SimpleCommand } from './index';
import * as embeds from '../embeds';
import { YoutubeStreamer } from '../voice_manager';

const voiceCategory = new Category('Audio', 'Commandes relatives aux flux audio');

class ComeCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'come',
            'Se connecter à votre channel',
            [],
            ''
        );
        this.category = voiceCategory;
    }

    execute(message, args, usageError)
    {
        message.delete();
        if (this.app.voiceManager.connected) this.app.voiceManager.disconnect();

        if (!message.member.voiceChannel)
        {
            error(this.app, 'Vous n\'êtes connecté sur aucun channel');
            return;
        }

        const app = this.app;

        message.member.voiceChannel.join().then(
            connection => app.voiceManager.connect(connection)
        ).catch(err => error(app, err));
    }
}

class PlayCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'play',
            'Ajoute une vidéo à la queue (youtube)',
            ['yt'],
            '{url}'
        );
        this.category = voiceCategory;
    }

    execute(message, args, usageError)
    {
        message.delete();
        if (args.length < 1)
        {
            usageError();
            return;
        }

        if (!this.app.voiceManager.connected)
        {
            error(this.app, 'Le bot n\'est connecté à aucun channel');
            return;
        }

        if (YoutubeStreamer.isYoutube(args[0]))
        {
            const app = this.app;
            new YoutubeStreamer(message.member, args[0]).fetchInfo().then(
                streamer =>
                {
                    app.voiceManager.addToQueue(streamer);
                }
            ).catch(err => error(app, err));

            return;
        }

        error(this.app, 'Je ne comprends pas cet url');
    }
}

class StopCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'stop',
            'Stopper le bot de musique',
            [],
            ''
        );
        this.category = voiceCategory;
    }

    execute(message, args, usageError)
    {
        message.delete();
        if (!this.app.voiceManager.connected)
        {
            error(this.app, 'Le bot n\'est connecté à aucun channel');
            return;
        }

        this.app.voiceManager.disconnect();
    }
}

class PauseCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'pause',
            'Pauser/Reprendre une musique',
            [],
            ''
        );
        this.category = voiceCategory;
    }

    execute(message, args, usageError)
    {
        message.delete();

        if (!this.app.voiceManager.connected)
        {
            error(this.app, 'Le bot n\'est connecté à aucun channel');
            return;
        }

        if (!this.app.voiceManager.playing)
        {
            error(this.app, 'Le bot ne joue pas actuellement');
            return;
        }

        this.app.voiceManager.pause = !this.app.voiceManager.pause;
    }
}

class SkipCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'skip',
            'Passer une musique',
            ['next'],
            '[num]'
        );
        this.category = voiceCategory;
    }

    execute(message, args, usageError)
    {
        message.delete();
        let num = args[0] || 1;
        num     = num > 0 ? num : 1; //Nonnull & nonnegative

        if (!this.app.voiceManager.connected)
        {
            error(this.app, 'Le bot n\'est connecté à aucun channel');
            return;
        }

        this.app.voiceManager.skip(num);
    }
}

class ClearQueueCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'clearQueue',
            'Vider la queue de toutes ses musiques',
            [],
            ''
        );
        this.category = voiceCategory;
    }

    execute(message, args, usageError)
    {
        message.delete();

        if (!this.app.voiceManager.connected)
        {
            error(this.app, 'Le bot n\'est connecté à aucun channel');
            return;
        }

        this.app.voiceManager.clearQueue();
    }
}

class RemoveCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'remove',
            'Supprimer une musique de la queue',
            [],
            '[num]'
        );
        this.category = voiceCategory;
    }

    execute(message, args, usageError)
    {
        message.delete();
        let num = args[0] || 0;
        num     = num >= 0 ? num : 0; //Nonnegative

        if (!this.app.voiceManager.connected)
        {
            error(this.app, 'Le bot n\'est connecté à aucun channel');
            return;
        }

        this.app.voiceManager.removeFromQueue(num);
    }
}

class QueueCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'queue',
            'Montrer toutes les musiques',
            [],
            ''
        );
        this.category = voiceCategory;
    }

    execute(message, args, usageError)
    {
        message.delete();

        if (!this.app.voiceManager.connected)
        {
            error(this.app, 'Le bot n\'est connecté à aucun channel');
            return;
        }

        this.app.voiceManager.dispQueue();
    }
}

class VolumeCommand extends SimpleCommand
{
    constructor(app)
    {
        super(
            app,
            'volume',
            'Montrer/Définir le volume',
            [],
            '[volume%]'
        );
        this.category = voiceCategory;
    }

    execute(message, args, usageError)
    {
        message.delete();
        if (!this.app.voiceManager.connected)
        {
            error(this.app, 'Le bot n\'est connecté à aucun channel');
            return;
        }

        if (args.length < 1 || args[0] < 0) //Nonnegative
        {
            this.app.voiceManager.dispVolume();
            return;
        }

        const match = /^(\d+)%?$/.exec(args[0]);

        if (!match || match[1] > 200)
        {
            error(this.app, `${match} n'est pas un pourcentage`);
            return;
        }

        this.app.voiceManager.volume = match[1];
    }
}

function error(app, error)
{
    const embed = embeds.error(app)
        .setTitle(error);

    app.botsChannel.send({ embed })
        .then(message => embeds.timeDelete(message));
}

const commands = [
    ComeCommand, PlayCommand, StopCommand, PauseCommand,
    SkipCommand, ClearQueueCommand, RemoveCommand, QueueCommand,
    VolumeCommand
];

export function register(app, registerOne)
{
    commands.forEach(constr => registerOne(new constr(app)));
}