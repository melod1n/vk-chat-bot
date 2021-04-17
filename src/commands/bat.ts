import {Command, Requirements} from '../model/chat-command';
import {Utils} from '../util/utils';
import {Api} from '../api/api';

export class Bat extends Command {
    regexp = /^\/bat\s([^]+)/i;
    title = '/bat [value]';
    name = '/bat';
    description = 'executes value in cmd';

    requirements = Requirements.builder().apply(true);

    async execute(context, params) {
        const text = params[1];

        Utils.executeCommand(text)
            .then(r => Api.sendMessage(context, r))
            .catch(console.error);
    }

}