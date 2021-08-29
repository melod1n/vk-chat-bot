import {Command, Requirements} from '../model/chat-command';
import {Utils} from '../util/utils';
import {Api} from '../api/api';

export class Bat extends Command {
    regexp = /^\/bat\s([^]+)/i;
    title = '/bat [value]';
    name = '/bat';
    description = 'executed value in cmd';

    requirements = Requirements.builder().apply(true);

    async execute(context, params) {
        const text = params[1];

        const result = await Utils.executeCommand(text);
        await Api.sendMessage(context, result);
    }

}