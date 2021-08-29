import {Command, Requirements} from '../model/chat-command';
import {LoadManager} from '../api/load-manager';
import {Utils} from '../util/utils';
import {Api} from '../api/api';
import {whoAnswers} from '../database/settings-storage';
import {CacheStorage} from '../database/cache-storage';

export class Who extends Command {
    regexp = /^\/(who|кто)\s([^]+)/i;
    title = '/who [value]';
    description = 'random people from chat\'s participants (only users)';

    requirements = Requirements.builder().apply(false, false, true, true, false, false);

    async execute(context) {
        let chat = await CacheStorage.chats.getSingle(context.peerId);
        if (!chat) chat = await LoadManager.chats.loadSingle(context.peerId);

        const userId = chat.users[Utils.getRandomInt(chat.users.length)];

        if (!userId) {
            await context.reply('никого не нашёл :(');
            return;
        }

        let user = await CacheStorage.users.getSingle(userId);
        if (!user) user = await LoadManager.users.loadSingle(userId);

        const text = `@id${userId}(${user.firstName} ${user.lastName})`;

        const spl = context.text.trim().split(' ');
        spl[0] = '';

        const v = spl.join(' ');

        const index = Utils.getRandomInt(whoAnswers.length);

        await Api.sendMessage(context, `${whoAnswers[index]} ${v} — ${text}`, true);
    }
}