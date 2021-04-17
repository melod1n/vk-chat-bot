import {Command} from '../model/chat-command';
import {database} from '../database/database';
import {Api} from '../api/api';
import {CacheStorage} from '../database/cache-storage';
import {LoadManager} from '../api/load-manager';

export class Admins extends Command {
    regexp = /^\/admins/i;
    title = '/admins';
    description = 'returns list of bot\'s admins';

    async execute(context) {
        if (database.admins.length == 0) {
            await Api.sendMessage(context, 'Администраторов нет 😞');
            return;
        }

        let text = 'Список администраторов:\n\n';

        for (let i = 0; i < database.admins.length; i++) {
            const id = database.admins[i];

            let user = await CacheStorage.getUser(id);

            if (!user) {
                user = await LoadManager.loadUser(id);
            }

            text += `❤ @id${id}(${user.firstName} ${user.lastName})\n`;
        }

        await Api.sendMessage(context, text, true);
    }

}