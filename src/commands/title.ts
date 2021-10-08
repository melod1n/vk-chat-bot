import {Command, Requirements} from '../model/chat-command';
import {Api} from '../api/api';
import {LoadManager} from '../api/load-manager';
import {vk} from '../index';
import {MemoryCache} from '../database/memory-cache';

class Title extends Command {
    regexp = /^\/title\s([^]+)/i;
    title = '/title [value]';
    name = '/title';
    description = 'changes current chat\'s title';

    requirements = Requirements.Build().apply(false, true, true, true);

    async execute(context, params) {
        await Api.changeChatTitle(context, params[1]);
    }
}

class UserTitle extends Command {
    regexp = /^\/usertitle\s(\d+)/i;
    title = '/userTitle [userId]';
    name = '/userTitle';
    description = 'changes chat\'s photo and title to user\'s';

    requirements = Requirements.Build().apply(false, true, true, true);

    async execute(context, params) {
        try {
            const userId = Number(params[1]);

            let user = await MemoryCache.getUser(userId);
            if (!user) user = await LoadManager.users.loadSingle(userId);

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
        } catch (e) {
            await Api.sendMessage(context, 'Произошла ошибка.');
        }

    }
}

export {Title, UserTitle};