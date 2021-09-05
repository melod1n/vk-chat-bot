import {Command, Requirements} from '../model/chat-command';
import {LoadManager} from '../api/load-manager';
import {Api} from '../api/api';

export class Offline extends Command {
    regexp = /^\/offline/i;
    title = '/offline';
    name = '/offline';
    description = 'offline users';

    requirements = Requirements.builder().apply(false, false, false, true);

    async execute(context): Promise<void> {
        let users = (await LoadManager.chats.loadSingle(context.peerId)).users;
        const allCount = users.length;

        users = users.filter((user) => !user.online);


        let text = `Не в сети (${users.length}/${allCount})\n`;

        for (const user of users) {
            const sexIcon = `${user.sex == 0 ? '👽' : user.sex == 1 ? '🚺' : '🚹'}`;
            const platform = user.onlineMobile ? '📱' : '💻';
            const name = `@id${user.id}(${user.firstName} ${user.lastName})`;
            const sex = `был${user.sex == 1 ? 'а' : user.sex == 0 ? 'о' : ''}`;
            const time = `${!user.onlineVisible ? '' : `${new Date(user.lastSeen * 1000).toLocaleString()}`}`;

            text += `${sexIcon} ${platform} ${name} ${time === '' ? '' : sex} ${time}\n`;
        }

        if (users.length == 0) text = 'Все онлайн 😀';

        await Api.sendMessage(context, text, true);
    }
}