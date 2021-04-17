import {Command, Requirements} from '../model/chat-command';
import {Api} from '../api/api';

export class Ae extends Command {
    regexp = /^\/ae\s([^]+)/i;
    title = '/ae [value]';
    name = '/ae';
    description = 'js eval';

    requirements = Requirements.builder().apply(true);

    async execute(context, params, fwd, reply) {
        const match = params[1];

        try {
            let e = eval(match);

            e = ((typeof e == 'string') ? e : JSON.stringify(e));

            await Api.sendMessage(context, e);
        } catch (e) {
            const text = e.message;

            if (text.includes('is not defined')) {
                await Api.sendMessage(context, 'variable is not defined');
                return;
            }

            console.error(`${text}
                * Stacktrace: ${e.stack}`);

            await Api.sendMessage(context, text);
        }
    }

}