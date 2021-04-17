import {Command, Requirements} from '../model/chat-command';
import {LoadManager} from '../api/load-manager';
import {Api} from '../api/api';

export class LoadUser extends Command {
    regexp = /^\/loaduser\s(\d+)/i;
    title = '/loadUser [id]';
    name = '/loadUser';
    description = 'returns user from vk api by it\'s id';

    requirements = Requirements.builder().apply(false, true);

    async execute(context, params) {
        await Api.sendMessage(context, JSON.stringify(await LoadManager.loadUser(parseInt(params[1]))));
    }

}