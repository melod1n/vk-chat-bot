import {Command} from '../model/chat-command';
import {Api} from '../api/api';
import {commands, increaseSentMessages, vk} from '../index';
import {Utils} from '../util/utils';

export class Help extends Command {
    regexp = /^\/help/i;
    title = '/help';
    description = 'shows list of the commands';

    async execute(context) {
        let text = `Список команд:\n\n`;

        commands.forEach((cmd) => {
            text += `"${cmd.title}": {\n  ${cmd.description}\n}\n`;
        });

        let error = null;

        vk.api.messages.send({
            peer_id: context.senderId,
            message: text,
            random_id: Utils.getRandomInt(10000)
        }).catch((e) => {
            error = e;
        }).then((r) => {
            if (error) {
                Api.sendMessage(context, 'Не смог отправить команды в ЛС ☹');
                return;
            }

            increaseSentMessages();

            if (context.isChat) Api.sendMessage(context, 'Отправил команды в ЛС 😎');
        });
    }

}