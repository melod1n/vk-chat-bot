import {Command, Requirements} from '../model/chat-command';
import {Api} from '../api/api';

export class Title extends Command {
    regexp = /^\/title\s([^]+)/i;
    title = '/title [value]';
    name = '/title';
    description = 'changes current chat\'s title';

    requirements = Requirements.builder().apply(false, true, true, true);

    async execute(context, params) {
        await Api.changeChatTitle(context, params[1]);
    }

}