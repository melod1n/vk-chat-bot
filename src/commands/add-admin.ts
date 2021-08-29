import {Command, Requirements} from '../model/chat-command';
import {MessageContext, MessageForwardsCollection} from 'vk-io';
import {CacheStorage} from '../database/cache-storage';
import {TAG, TAG_ERROR} from '../index';
import {LoadManager} from '../api/load-manager';
import {Api} from '../api/api';

export class AddAdmin extends Command {

    regexp = /^\/addadmin/i;
    title = '/addAdmin';
    description = 'adds bot\'s admin by id or replied message';

    requirements = Requirements.builder().apply(true);

    async execute(context: MessageContext, params: string[],
                  fwd?: MessageForwardsCollection, reply?: MessageContext): Promise<void> {

        let userId = -1;

        if (reply) {
            userId = reply.senderId;
        }

        if (userId == -1) {
            if (context.text.includes(' ')) {
                const split = context.text.split(' ');
                try {
                    userId = Number(split[1]);
                    if (isNaN(userId)) userId = -1;
                } catch (e) {
                    userId = -1;
                }
            }
        }

        let messageId: number = null;

        if (userId <= 0) {
            console.log(`${TAG_ERROR}: /addAdmin: wrong userId`);
            await Api.sendMessage(context, 'Неверный userId.', null, context.id);
        } else {
            console.log(`${TAG}: /addAdmin: added new admin: ${userId}`);

            let user = await CacheStorage.users.getSingle(userId);
            if (!user) {
                messageId = await Api.sendMessage(context, 'секунду...');
                user = await LoadManager.users.loadSingle(userId);
            }

            const message = `@id${user.userId}(${user.firstName} ${user.lastName}) теперь администратор! 🥳`;

            const sendMessagePromise = Api.sendMessage(context, message, true);
            const storeUserPromise = CacheStorage.users.store([user]);
            const storeAdminPromise = CacheStorage.admins.store([user.userId]);

            await Promise.all([sendMessagePromise, storeUserPromise, storeAdminPromise]);
        }
    }

}