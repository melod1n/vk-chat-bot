import {Command, Requirements} from '../model/chat-command';

export class LoadUser extends Command {
    regexp = /^\/loaduser\s(\d+)/i;
    title = '/loadUser [id]';
    name = '/loadUser';
    description = 'user from vk api by it\'s id';

    requirements = Requirements.builder().apply(false, true);

    async execute(context, params) {
        // await Api.sendMessage(context, JSON.stringify(await LoadManager.users.load(`${parseInt(params[1])}`)));
    }

}