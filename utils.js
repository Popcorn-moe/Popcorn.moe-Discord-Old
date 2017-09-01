import fs from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

export function loadJson(file)
{
    return readFileAsync(file)
        .then((text) => JSON.parse(text));
}

const MENTION_MATCH = /^<@!?(\d+)>$/g;
const USER_MATCH    = /^@(.+)#(\d+)$/g;

// Try to find a user in a string
export function asUser(message, string)
{
    if (!message.guild) return null; //Should not happen :p (private message)

    const userMatch = USER_MATCH.exec(string);
    if (userMatch)
    {
        return message.guild.members
            .map(elem => elem.user)
            .find(user => user.username === userMatch[1] && user.discriminator === userMatch[2]);
    }

    const mentionMatch = MENTION_MATCH.exec(string);
    if (mentionMatch)
    {
        return message.guild.members
            .map(elem => elem.user)
            .find(user => user.id === mentionMatch[1]);
    }

    return message.guild.members
        .map(elem => elem.user)
        .find(user => user.username.indexOf(string) >= 0);
}


export function sendAndMention(app, embed, user) { app.botsChannel.send(getMention(user), { embed }); }

export function getMention(user) { return `<@${user.id}>`; }

export function randIn(array)
{
    const rand = Math.floor(Math.random() * Object.keys(array).length);
    return array[rand];
}