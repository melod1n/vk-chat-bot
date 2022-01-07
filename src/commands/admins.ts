import {Command, Requirement, Requirements} from '../model/chat-command';
import {Api} from '../api/api';
import {LoadManager} from '../api/load-manager';
import {MemoryCache} from '../database/memory-cache';
import {CacheStorage} from '../database/cache-storage';
import {MessageContext, MessageForwardsCollection} from 'vk-io';
import {TAG, TAG_ERROR} from '../index';
import {StorageManager} from '../database/storage-manager';
import {VkUser} from '../model/vk-user';

class AdminsList extends Command {
    regexp = /^\/admins/i;
    title = '/admins';
    description = 'list of bot\'s admins';

    async execute(context) {
        if (MemoryCache.isAdminsEmpty()) {
            await Api.sendMessage(context, 'Администраторов нет 😞');
            return;
        }

        let text = 'Список администраторов:\n\n';

        for (let i = 0; i < MemoryCache.adminsSize(); i++) {
            const id = MemoryCache.getAdminByIndex(i);

            let user = await MemoryCache.getUser(id);
            if (!user) user = await LoadManager.users.loadSingle(id);

            text += `❤ @id${id}(${user.firstName} ${user.lastName})\n`;
        }

        await Api.sendMessage(context, text, true);
    }
}

class AdminAdd extends Command {

    regexp = /^\/addadmin/i;
    title = '/addAdmin';
    description = 'adds bot\'s admin by id or replied message';

    requirements = Requirements.Create(Requirement.BOT_CREATOR);

    async execute(
        context: MessageContext,
        params: string[],
        fwd?: MessageForwardsCollection,
        reply?: MessageContext
    ): Promise<void> {

        let userId: number = null;

        if (reply) {
            userId = reply.senderId;
        }

        if (userId < 0) {
            console.error(`${TAG_ERROR}: /addAdmin: groupId not allowed`);
            await context.reply('Группу нельзя добавить администратором 🙄');
            await StorageManager.increaseSentMessagesCount();
            return;
        }

        if (!userId) {
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

        if (!userId || userId < 0) {
            console.log(`${TAG_ERROR}: /addAdmin: wrong userId`);
            await context.reply('Неверный userId.');
            await StorageManager.increaseSentMessagesCount();
        } else {
            let waitContext = null;

            let message: string;

            if (MemoryCache.includesAdmin(userId)) {
                console.log(`${TAG}: /addAdmin: admin exists: ${userId}`);

                let user = await MemoryCache.getUser(userId);
                if (!user) {
                    waitContext = await context.send('секунду...');
                    user = await LoadManager.users.loadSingle(userId);
                    if (user) await CacheStorage.users.storeSingle(user);
                }

                message = `@id${user.id}(${user.firstName} ${user.lastName}) уже является администратором 🙄`;
            } else {
                console.log(`${TAG}: /addAdmin: added new admin: ${userId}`);

                let user = await MemoryCache.getUser(userId);

                if (!user) {
                    waitContext = await context.send('секунду...');
                    user = await LoadManager.users.loadSingle(userId);
                }

                if (user) await CacheStorage.users.storeSingle(user);

                message = `@id${user.id}(${user.firstName} ${user.lastName}) теперь администратор! 🥳`;

                MemoryCache.appendAdmin(userId);
                await CacheStorage.admins.storeSingle(userId);
            }

            await (waitContext ?
                Api.editMessage(context.peerId, waitContext.conversationMessageId, message) :
                Api.sendMessage(context, message, true));

        }
    }

}

class AdminRemove extends Command {

    regexp = /^\/removeAdmin/i;
    title = '/removeAdmin';
    name = '/removeAdmin';
    description = 'removes bot\'s admin';

    requirements = Requirements.Create(Requirement.BOT_CREATOR);

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

            let user = await MemoryCache.getUser(userId);
            if (!user) {
                await Api.sendMessage(context, 'секунду...');
                user = await LoadManager.users.loadSingle(userId);
            }

            const message = `@id${user.id}(${user.firstName} ${user.lastName}) больше не администратор 💔`;

            await Api.sendMessage(context, message, true);
        }
    }

}

export {AdminsList, AdminAdd, AdminRemove};