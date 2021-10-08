import {Command, Requirements} from '../model/chat-command';
import {LoadManager} from '../api/load-manager';
import {Api} from '../api/api';

export class LoadUser extends Command {
    regexp = /^\/loaduser\s(\d+)/i;
    title = '/loadUser [id]';
    name = '/loadUser';
    description = 'user from vk api by it\'s id';

    requirements = Requirements.Build().apply(false, true);

    async execute(context, params) {
        try {
            const user = await LoadManager.users.loadSingle(Number(params[1]));
            await Api.sendMessage(context, JSON.stringify(user));
        } catch (e) {
            await Api.sendMessage(context, 'Произошла ошибка.');
        }
    }
}