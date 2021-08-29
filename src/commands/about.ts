import {Command} from '../model/chat-command';
import {Api} from '../api/api';

export class About extends Command {
    regexp = /^\/about/i;
    title = '/about';
    description = 'information about this bot';

    async execute(context) {
        await Api.sendMessage(context, '@melod1n', true);
    }

}