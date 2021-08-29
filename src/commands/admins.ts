import {Command} from '../model/chat-command';
import {Api} from '../api/api';
import {CacheStorage} from '../database/cache-storage';
import {LoadManager} from '../api/load-manager';
import {MemoryCache} from '../database/memory-cache';

export class Admins extends Command {
    regexp = /^\/admins/i;
    title = '/admins';
    description = 'list of bot\'s admins';

    async execute(context) {
        if (MemoryCache.admins.length == 0) {
            await Api.sendMessage(context, 'Администраторов нет 😞');
            return;
        }

        let text = 'Список администраторов:\n\n';

        for (let i = 0; i < MemoryCache.admins.length; i++) {
            const id = MemoryCache.admins[i];

            let user = await CacheStorage.users.getSingle(id);
            if (!user) user = await LoadManager.users.loadSingle(id);

            text += `❤ @id${id}(${user.firstName} ${user.lastName})\n`;
        }

        await Api.sendMessage(context, text, true);
    }

}