import {Command} from '../model/chat-command';
import {Utils} from '../util/utils';
import {Api} from '../api/api';
import {StorageManager} from '../database/storage-manager';

export class Stats extends Command {
    regexp = /^\/stats/i;
    title = '/stats';
    description = 'bot\'s stats';

    async execute(context) {
        const text = `Статистика бота.\n\n⏳ Время работы: ${Utils.getUptime()}\n📥 Сообщений получено: ${StorageManager.currentReceivedMessages}\n📤 Сообщений отправлено: ${StorageManager.currentSentMessages}`;
        const allStats = `\n\n📥 Сообщений получено (всего): ${StorageManager.settings.messagesReceived}\n📤 Сообщений отправлено (всего): ${StorageManager.settings.messagesSent}`;
        await Api.sendMessage(context, text);
    }
}