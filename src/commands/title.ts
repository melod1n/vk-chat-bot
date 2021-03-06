import {Command, Requirement, Requirements} from '../model/chat-command';
import {Api} from '../api/api';
import {LoadManager} from '../api/load-manager';
import {vk} from '../index';
import {MemoryCache} from '../database/memory-cache';
import {MessageContext} from 'vk-io';

class Title extends Command {
    regexp = /^\/title\s([^]+)/i;
    title = '/title [value]';
    name = '/title';
    description = 'changes current chat\'s title';

    requirements = Requirements.Create(
        Requirement.CHAT,
        Requirement.BOT_CHAT_ADMIN,
        Requirement.BOT_ADMIN
    );

    async execute(context, params) {
        await Api.changeChatTitle(context, params[1]);
    }
}

class UserTitle extends Command {
    regexp = /^\/usertitle\s(\d+)/i;
    title = '/userTitle [userId]';
    name = '/userTitle';
    description = 'changes chat\'s photo and title to user\'s';

    requirements = Requirements.Create(
        Requirement.CHAT,
        Requirement.BOT_CHAT_ADMIN,
        Requirement.BOT_ADMIN
    );

    async execute(context, params) {
        const userId = Number(params[1]);

        let waitContext: MessageContext = await context.send('секунду...');

        try {
            let user = await MemoryCache.getUser(userId);
            if (!user) {
                user = await LoadManager.users.loadSingle(userId);
            }

            const fullName = `${user.firstName} ${user.lastName}`;
            const photo = user.photo200;

            if (photo) {
                await vk.upload.chatPhoto({
                    chat_id: context.chatId,
                    crop_x: 0,
                    crop_y: 0,
                    crop_width: 200,
                    source: {value: photo}
                });
            }

            await Api.changeChatTitle(context, fullName);
            await Api.deleteMessage(context.peerId, waitContext.conversationMessageId);
        } catch (e) {
            console.error(e);

            const errorText = e.code == 22 ? 'Ошибка загрузки аватарки 😾' :
                e.code == 100 ? 'Неверный id пользователя 😠'
                    : 'Произошла ошибка 😖';

            await Api.editMessage(context.peerId, waitContext.conversationMessageId, errorText);
        }

    }
}

export {Title, UserTitle};