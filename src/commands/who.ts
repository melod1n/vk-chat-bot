import {Command, Requirements} from '../model/chat-command';
import {LoadManager} from '../api/load-manager';
import {Utils} from '../util/utils';
import {Api} from '../api/api';
import {CacheStorage} from '../database/cache-storage';
import {StorageManager} from '../database/storage-manager';
import {MemoryCache} from '../database/memory-cache';

export class Who extends Command {
    regexp = /^\/(who|кто)\s([^]+)/i;
    title = '/who [value]';
    description = 'random people from chat\'s participants (only users)';

    requirements = Requirements.Build().apply(false, false, true, true, false, false);

    async execute(context) {
        let chat = await MemoryCache.getChat(context.peerId);
        if (!chat) chat = await LoadManager.chats.loadSingle(context.peerId);

        const userId = chat.usersIds[Utils.getRandomInt(chat.usersIds.length)];

        if (!userId) {
            await context.reply('никого не нашёл :(');
            return;
        }

        let user = await MemoryCache.getUser(userId);
        if (!user) user = await LoadManager.users.loadSingle(userId);

        const text = `@id${userId}(${user.firstName} ${user.lastName})`;

        const spl = context.text.trim().split(' ');
        spl[0] = '';

        const v = spl.join(' ');

        const index = Utils.getRandomInt(StorageManager.answers.whoAnswers.length);

        await Api.sendMessage(context, `${StorageManager.answers.whoAnswers[index]} ${v} — ${text}`, true);
    }
}