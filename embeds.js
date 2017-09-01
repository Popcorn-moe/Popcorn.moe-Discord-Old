// This file adds presets for embeds.

import discord from 'discord.js';
import * as utils from './utils';

export function error(app)
{
    return new discord.RichEmbed()
        .setColor(0xdb1348)
        .setImage(utils.randIn(app.settings.images.error));
}
