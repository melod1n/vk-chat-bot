import {Command} from '../model/chat-command';
import {Api} from '../api/api';
import {commands, increaseSentMessages, vk} from '../index';
import {Utils} from '../util/utils';

//TODO: rewrite forEach
export class Help extends Command {
    regexp = /^\/help/i;
    title = '/help';
    description = 'this list';

    async execute(context) {
        let text = `Commands = [\n`;

        commands.forEach((cmd) => {
            text += ` "${cmd.title}": {\n   return: ${cmd.description}\n},\n`;
        });

        text = text.substring(0, text.length - 2);

        text += ']';

        let error = null;

        vk.api.messages.send({
            peer_id: context.senderId,
            message: text,
            random_id: Utils.getRandomInt(10000)
        }).catch((e) => {
            error = e;
        }).then(() => {
            if (error) {
                Api.sendMessage(context, 'Не смог отправить команды в ЛС ☹');
                return;
            }

            increaseSentMessages();

            if (context.isChat) Api.sendMessage(context, 'Отправил команды в ЛС 😎');
        });
    }
}