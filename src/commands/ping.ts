import {Command} from '../model/chat-command';
import {Api} from '../api/api';

export class Ping extends Command {
    regexp = /^\/ping/i;
    title = '/ping';
    description = 'bot\'s ping';

    async execute(context) {
        let startTime = new Date().getMilliseconds();

        await Api.sendMessage(context, 'pong');

        const nowMillis = new Date().getMilliseconds();

        const change = Math.abs(nowMillis - startTime);

        await Api.sendMessage(context, `ping: ${change} ms`);
    }


}