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
// Return a Promise
export function asUser(message, string)
{
    const userMatch = USER_MATCH.exec(string);
    if (userMatch)
    {
        return new Promise(
            (resolve, reject) =>
            {
                const result = message.guild.members
                    .map(elem => elem.user)
                    .filter(user => user.username === userMatch[1] && user.discriminator === userMatch[2])[0];

                result ? resolve(result) : reject('Aucun utilisateur trouvé.');
            }
        );
    }

    const mentionMatch = MENTION_MATCH.exec(string);
    if (mentionMatch)
    {
        return message.client.fetchUser(mentionMatch[1]);
    }

    if (!message.guild) return Promise.reject('Vous devez envoyer ce message sur un serveur.');

    return new Promise(
        (resolve, reject) =>
        {
            const result = message.guild.members
                .map(elem => elem.user)
                .filter(user => user.username.indexOf(string) >= 0)[0];

            result ? resolve(result) : reject('Aucun utilisateur trouvé.');
        }
    );
}


export function sendAndMention(app, embed, user) { app.botsChannel.send(getMention(user), { embed }); }

export function getMention(user) { return `<@${user.id}>`; }

export function randIn(array)
{
    const rand = Math.floor(Math.random() * Object.keys(array).length);
    return array[rand];
}