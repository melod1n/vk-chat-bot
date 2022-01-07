import {Command} from '../model/chat-command';
import {Utils} from '../util/utils';
import {Api} from '../api/api';

export class Random extends Command {
    regexp = /^\/random\s(\d+)\s(\d+)/i;
    title = '/random [min] [max]';
    name = '/random';
    description = 'ranged random from parameters';

    async execute(context, params) {
        const min = parseInt(params[1]);
        const max = parseInt(params[2]);
        const random = Utils.getRangedRandomInt(min, max);

        const randomText = `[${min}; ${max}]: ${random}`;

        await Api.sendMessage(context, randomText);
    }

}