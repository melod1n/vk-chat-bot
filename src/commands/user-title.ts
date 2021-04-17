import {Command, Requirements} from '../model/chat-command';
import {vk} from '../index';
import {LoadManager} from '../api/load-manager';
import {Api} from '../api/api';
import {CacheStorage} from '../database/cache-storage';

export class UserTitle extends Command {
    regexp = /^\/usertitle\s(\d+)/i;
    title = '/userTitle [userId]';
    name = '/userTitle';
    description = 'change chat\'s photo and title to user\'s';

    requirements = Requirements.builder().apply(false, true, true, true);

    async execute(context, params) {
        const userId = parseInt(params[1]);

        let user = await CacheStorage.getUser(userId);
        if (!user) user = await LoadManager.loadUser(userId);

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
    }

}