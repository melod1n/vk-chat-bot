import {Command} from '../model/chat-command';
import {Api} from '../api/api';

export class Ping extends Command {
    regexp = /^\/ping/i;
    title = '/ping';
    description = 'bot\'s ping';

    async execute(context) {
        let startTime = Date.now();

        await Api.sendMessage(context, 'pong');

        const nowMillis = Date.now();

        const change = Math.abs(nowMillis - startTime);

        await Api.sendMessage(context, `ping: ~${change} ms`);
    }


}