import {Command, Requirements} from '../model/chat-command';
import {TAG, TAG_ERROR} from '../index';
import {Api} from '../api/api';
import {LoadManager} from '../api/load-manager';
import {CacheStorage} from '../database/cache-storage';

export class RemoveAdmin extends Command {

    regexp = /^\/removeAdmin/i;
    title = '/removeAdmin';
    name = '/removeAdmin';
    description = 'removes bot\'s admin';

    requirements = Requirements.builder().apply(true);

    async execute(context, params, fwd, reply): Promise<void> {

        let userId: number = null;

        if (reply) {
            userId = reply.senderId;
        }

        if (!userId) {
            if (context.text.includes(' ')) {
                try {
                    userId = Number(context.text.split(' ')[1]);
                    if (isNaN(userId)) userId = null;
                } catch (e) {
                    userId = null;
                }
            }
        }

        if (!userId || userId < 0) {
            console.log(`${TAG_ERROR}: /removeAdmin: wrong userId`);
            await Api.sendMessage(context, 'Неверный userId.', null, context.id);
        } else {
            console.log(`${TAG}: /removeAdmin: removed admin: ${userId}`);
            await CacheStorage.admins.deleteSingle(userId);

            let user = await CacheStorage.users.getSingle(userId);
            if (!user) {
                await Api.sendMessage(context, 'секунду...');
                user = await LoadManager.users.loadSingle(userId);
            }

            const message = `@id${user.id}(${user.firstName} ${user.lastName}) больше не администратор 💔`;

            await Api.sendMessage(context, message, true);
        }
    }

}