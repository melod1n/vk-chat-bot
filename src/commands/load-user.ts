import {Command, Requirement, Requirements} from '../model/chat-command';
import {LoadManager} from '../api/load-manager';
import {Api} from '../api/api';

export class LoadUser extends Command {
    regexp = /^\/loaduser\s(\d+)/i;
    title = '/loadUser [id]';
    name = '/loadUser';
    description = 'user from vk api by it\'s id';

    requirements = Requirements.Create(Requirement.BOT_ADMIN);

    async execute(context, params) {
        const waitContext = await context.send('секунду...');

        try {
            const user = await LoadManager.users.loadSingle(Number(params[1]));

            await Api.editMessage(context.peerId, waitContext.conversationMessageId, JSON.stringify(user));
        } catch (e) {
            await Api.editMessage(context.peerId, waitContext.conversationMessageId, 'Произошла ошибка 😥');
        }
    }
}