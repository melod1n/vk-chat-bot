import {Command, Requirements} from '../model/chat-command';
import {LoadManager} from '../api/load-manager';
import {Api} from '../api/api';

export class Online extends Command {

    regexp = /^\/online/i;
    title = '/online';
    name = '/online';
    description = 'users who online';

    requirements = Requirements.builder().apply(false, false, false, true);

    async execute(context): Promise<void> {
        let users = (await LoadManager.chats.loadSingle(context.peerId)).users;
        const allCount = users.length;

        users = users.filter((user) => user.online);

        let text = `В сети (${users.length}/${allCount})\n`;

        for (const user of users) {
            const sexIcon = `${user.sex == 0 ? '👽' : user.sex == 1 ? '🚺' : '🚹'}`;
            const platform = user.onlineMobile ? '📱' : '💻';
            const name = `@id${user.id}(${user.firstName} ${user.lastName})`;
            const sex = `заш${user.sex == 1 ? 'ла' : user.sex == 0 ? 'ло' : 'ёл'}`;
            const time = `${!user.onlineVisible ? '' : `${new Date(user.lastSeen * 1000).toLocaleString()}`}`;


            text += `${sexIcon} ${platform} ${name} ${time === '' ? '' : sex} ${time}\n`;
        }

        if (users.length == 0) text = 'Все офлайн 😢';

        await Api.sendMessage(context, text, true);

    }

}