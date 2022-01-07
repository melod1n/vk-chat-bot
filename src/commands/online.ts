import {Command, Requirement, Requirements} from '../model/chat-command';
import {LoadManager} from '../api/load-manager';
import {Api} from '../api/api';

export class Online extends Command {

    regexp = /^\/online/i;
    title = '/online';
    name = '/online';
    description = 'users who online';

    requirements = Requirements.Create(Requirement.CHAT);

    async execute(context): Promise<void> {
        const waitContext = await context.send('секунду...');

        const users = (await LoadManager.chats.loadSingle(context.peerId)).users;
        const allCount = users.length;

        const hiddenOnlineUsers = users.filter((user) => !user.onlineVisible);
        const onlineUsers = users.filter((user) => user.online);

        let text = `В сети (${onlineUsers.length}/${allCount})\n`;

        for (const user of onlineUsers) {
            const sexIcon = `${user.sex == 0 ? '👽' : user.sex == 1 ? '🚺' : '🚹'}`;
            const platform = user.onlineMobile ? '📱' : '💻';
            const name = `@id${user.id}(${user.firstName} ${user.lastName})`;
            const sex = `заш${user.sex == 1 ? 'ла' : user.sex == 0 ? 'ло' : 'ёл'}`;
            const time = `${!user.onlineVisible ? '' : `${new Date(user.lastSeen * 1000).toLocaleString()}`}`;

            text += `${sexIcon} ${platform} ${name} ${time === '' ? '' : sex} ${time}\n`;
        }

        if (onlineUsers.length == 0) text = 'Все офлайн 😢';
        if (hiddenOnlineUsers.length > 0) {
            text += `\n(Пользователей, скрывших онлайн: ${hiddenOnlineUsers.length})`;
        }

        await Api.editMessage(context.peerId, waitContext.conversationMessageId, text);
    }

}