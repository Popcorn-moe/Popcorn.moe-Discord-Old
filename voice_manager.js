import ytdl from 'ytdl-core';
import discord from 'discord.js';
import * as embeds from './embeds';
import * as utils from './utils';

const greets = [
    './assets/moemoekyun.mp3',
    './assets/niconiconi.mp3',
    './assets/nyanpasu.mp3',
    './assets/tuturu.mp3'
];

export class VoiceManager
{
    constructor(app)
    {
        this.app          = app;
        this.connection   = null;
        this.handler      = null;
        this.paused       = false;
        this.cachedVolume = 10; //10%
        this.queue        = [];
        this.current      = null;
    }

    connect(connection)
    {
        this.connection = connection;
        this.queue      = [];

        const embed = new discord.RichEmbed()
            .setTitle(`Connecté sur ${connection.channel.name}!`)
            .setColor(0x3df75f); //Todo gif :)
        connection.playFile(utils.randIn(greets), { volume: 0.75 });

        this.app.botsChannel.send({ embed });
    }

    disconnect()
    {
        this.connection.disconnect();

        this.stopMusic();

        this.connection = null;
        this.paused     = false;
        this.queue      = [];
        this.current    = null;

        const embed = new discord.RichEmbed()
            .setTitle(`Déconnecté.`)
            .setColor(0xdb1348); //Todo gif :)

        this.app.botsChannel.send({ embed });
    }

    addToQueue(streamer)
    {
        this.queue.push(streamer);

        if (this.current === null && this.queue.length === 1)
        {
            this.next();
            return;
        }

        const embed = streamer.embed
            .setColor(0x3df75f);
        this.app.botsChannel.send(
            `🎵  Ajouté à la queue (ajouté par ${streamer.adder.displayName})  🎵`,
            { embed });

    }

    next()
    {
        console.log('next');
        this.paused    = false;
        const streamer = this.queue.shift();
        this.current   = streamer;

        if (!streamer)
        {
            this.app.client.user.setGame();
            return;
        }

        this.app.client.user.setGame('🎵 ' + streamer.title);

        const embed = streamer.embed
            .setColor(0x3dd8f7);
        this.app.botsChannel.send(
            `🎵  Actuellement joué sur ${this.channel.name} (ajouté par ${streamer.adder.displayName})  🎵`,
            { embed });

        this.stopMusic();

        //Don't seem to work without timeout
        setTimeout(
            () =>
            {
                console.log('handler');
                const volume = this.volume / 100;
                console.log(volume);
                this.handler = this.connection.playStream(streamer.stream, { volume });
                this.handler.once('end', reason => this.next());

                //Event handling
                this.handler.on('error', err =>
                {
                    const embed = embeds.error(this.app)
                        .setTitle(err);

                    this.app.botsChannel.send({ embed })
                        .then(message => embeds.timeDelete(message));
                });

            }, 2000);
    }

    stopMusic()
    {
        this.handler && this.handler.end();
        this.handler = null;
        this.current = null;
    }

    skip(num = 1)
    {
        const diff       = this.queue.length - num;
        const hasCurrent = this.playing ? 1 : 0;
        const embed      = new discord.RichEmbed()
            .setTitle(`${diff > 0 ? diff + hasCurrent : hasCurrent} musiques passées`)
            .setColor(0xeaf73d); //Todo gif :)
        this.app.botsChannel.send({ embed });

        this.queue.splice(0, num - 1);

        this.handler.end();
    }

    dispQueue()
    {
        this.app.botsChannel.send('🎵  Liste des musiques dans la queue  🎵');

        if (this.current)
        {
            const embed = this.current.embed
                .setColor(0x0ce9f4);
            this.app.botsChannel.send(
                `▶  Actuellement joué (ajouté par ${this.current.adder.displayName})`,
                { embed });
        }

        this.queue.forEach(
            streamer =>
            {
                const embed = streamer.embed
                    .setColor(0x0ce9f4);
                this.app.botsChannel.send(
                    `⏩  Ajouté par ${streamer.adder.displayName}`,
                    { embed });
            });
    }

    clearQueue()
    {
        this.queue = [];
        this.stopMusic();

        const embed = new discord.RichEmbed()
            .setTitle(`La queue a été vidée.`)
            .setColor(0xeaf73d); //Todo gif :)
        this.app.botsChannel.send({ embed });
    }

    get pause()
    {
        return this.paused;
    }

    set pause(pause)
    {
        pause ? this.handler.pause() : this.handler.resume();

        this.paused = pause;

        const embed = new discord.RichEmbed()
            .setTitle(pause ? '⏸  Pause' : '▶  Repris')
            .setColor(pause ? 0xeaf73d : 0x3df75f); //Todo gif :)
        this.app.botsChannel.send({ embed });
    }

    dispVolume()
    {
        const embed = new discord.RichEmbed()
            .setTitle(`Le volume est à ${this.volume}%!`)
            .setColor(0xeaf73d); //Todo gif :)
        this.app.botsChannel.send({ embed });
    }

    removeFromQueue(num)
    {
        if (num === 0)
        {
            this.skip();
            return;
        }

        const embed = new discord.RichEmbed()
            .setTitle(`Musique supprimée de la queue`)
            .setColor(0xeaf73d); //Todo gif :)
        this.app.botsChannel.send({ embed });

        this.queue.splice(num - 1, num);
    }

    //Reject if already busy
    //Used for macros
    connectionFor(channel)
    {
        return new Promise(
            (resolve, reject) =>
            {
                if (this.playing) reject('Déjà occupé');

                channel.join().then(connection => resolve(connection));
            }
        );
    }

    get volume()
    {
        return this.cachedVolume;
    }

    set volume(volume)
    {
        this.cachedVolume = volume;
        this.handler.setVolume(volume / 100);

        const embed = new discord.RichEmbed()
            .setTitle(`Le volume est maintenant à ${volume}%!`)
            .setColor(0xeaf73d); //Todo gif :)
        this.app.botsChannel.send({ embed });
    }

    get connected() { return this.connection; }

    get channel() { return this.connection.channel; }

    get playing() { return this.handler; }

    get queueEmpty() { return this.queue.length === 0; }
}

export class Streamer
{
    constructor(adder) { this.adder = adder; }

    get stream() {}

    get title() {}

    fetchInfo() {}
}

const YOUTUBE_COM_MATCH = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9-_]{11}/;
const YOUTU_BE_MATCH    = /^https?:\/\/(?:www\.)?youtu\.be\/[a-zA-Z0-9-_]{11}/;

export class YoutubeStreamer extends Streamer
{
    static isYoutube(url)
    {
        return YOUTUBE_COM_MATCH.test(url) || YOUTU_BE_MATCH.test(url);
    }

    constructor(adder, url)
    {
        super(adder);
        this.url  = url;
        this.info = null;
    }

    get stream()
    {
        return ytdl(this.url, { filter: 'audioonly' });
    }

    fetchInfo()
    {
        const self = this;
        return new Promise(
            (resolve, reject) => ytdl.getInfo(this.url).then(
                info =>
                {
                    self.info = info;
                    resolve(self);
                }).catch(err => reject(err))
        );
    }

    get embed()
    {
        return new discord.RichEmbed()
            .setAuthor(this.info.author.name, this.info.author.avatar, this.info.author.channel_url)
            .setImage(this.info.iurlmq)
            .setTitle(this.info.title)
            .setURL(this.url)
            .setFooter(this.length + ' - ' + this.info.short_view_count_text.replace('views', 'vues'))
            .setTimestamp(new Date(this.info.published));
    }

    get length()
    {
        const minutes = Math.floor(this.info.length_seconds / 60); //Integer division in js :(
        const seconds = this.info.length_seconds % 60;

        return (minutes > 0 ? `${minutes}min ` : '') + `${seconds}s`;
    }

    get title()
    {
        return this.info.title;
    }
}

