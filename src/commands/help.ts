import {Command} from '../model/chat-command';
import {Api} from '../api/api';
import {commands, TAG_ERROR, vk} from '../index';
import {Utils} from '../util/utils';
import {StorageManager} from '../database/storage-manager';

export class Help extends Command {
    regexp = /^\/help/i;
    title = '/help';
    description = 'this list';

    async execute(context) {
        const text = `Commands:\n\n${commands.join('\n')}`;

        try {
            await vk.api.messages.send({
                peer_id: context.senderId,
                message: text,
                random_id: 0
            }).then(async () => {
                if (!context.isChat) return;
                await context.reply('Отправил команды в ЛС 😎');
            });
        } catch (e) {
            console.error(`${TAG_ERROR}: help.ts: ${Utils.getExceptionText(e)}`);
            if (e.code == 901) {
                await context.reply('Разрешите мне писать Вам сообщения 🥺');
            } else {
                await context.reply('Не смог отправить команды в ЛС ☹');
            }
        }
    }
}