import {Command} from '../model/chat-command';
import {Utils} from '../util/utils';
import {Api} from '../api/api';
import {betterAnswers} from '../database/settings-storage';

export class WhatBetter extends Command {
    regexp = /^\/(what|что)\s(better|лучше)\s([^]+)\s(or|или)\s([^]+)/i;
    title = '/what better [a] or [b]';
    name = '/what better';
    description = 'returns a or b randomly (50% chance)';

    async execute(context, params) {
        const a = params[1];
        const b = params[2].trimStart();

        const text = `${betterAnswers[Utils.getRandomInt(betterAnswers.length)]} ${Utils.getRandomInt(2) == 1 ? a : b}`;

        await Api.sendMessage(context, text, true);
    }

}