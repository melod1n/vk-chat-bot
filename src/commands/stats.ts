import {Command} from '../model/chat-command';
import {settings} from '../database/settings-storage';
import {Utils} from '../util/utils';
import {Api} from '../api/api';
import {currentReceivedMessages, currentSentMessages} from '../index';

export class Stats extends Command {
    regexp = /^\/stats/i;
    title = '/stats';
    description = 'bot\'s stats';

    async execute(context) {
        const text = `Статистика бота.\n\n⏳ Время работы: ${Utils.getUptime()}\n📥 Сообщений получено: ${currentReceivedMessages}\n📤 Сообщений отправлено: ${currentSentMessages}\n\n📥 Сообщений получено (всего): ${settings.messagesReceived}\n📤 Сообщений отправлено (всего): ${settings.messagesSent}`;
        await Api.sendMessage(context, text);
    }
}