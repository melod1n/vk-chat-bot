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
        let text = `Commands = [\n${Utils.getCommandText(commands[0])}`;

        for (let i = 1; i < commands.length; i++) {
            text += ',\n';
            text += Utils.getCommandText(commands[i]);
        }

        text += ']';

        try {
            await vk.api.messages.send({
                peer_id: context.senderId,
                message: text,
                random_id: Utils.getRandomInt(10000)
            }).then(async () => {
                await Promise.all([
                    StorageManager.increaseSentMessagesCount(),
                    Api.sendMessage(context, 'Отправил команды в ЛС 😎')
                ]);
            });
        } catch (e) {
            console.error(`${TAG_ERROR}: help.ts: ${Utils.getExceptionText(e)}`);
            if (e.code == 901) {
                await Api.replyMessage(context, 'Разрешите мне писать Вам сообщения 🥺');
            } else {
                await Api.sendMessage(context, 'Не смог отправить команды в ЛС ☹');
            }
        }
    }
}