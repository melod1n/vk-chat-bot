import {Command} from "../model/chat-command";
import {commands, TAG_ERROR, vk} from "../index";
import {Utils} from "../util/utils";
import { MessageContext, ContextDefaultState } from "vk-io";
import {Api} from "../api/api";

export class Help extends Command {
    regexp = /^\/help/i;
    title = "/help";
    description = "this list";

    async execute(context: MessageContext<ContextDefaultState> & object) {
        const text = `Commands:\n\n${commands.join("\n")}`;

        try {
            await vk.api.messages.send({
                peer_id: context.senderId,
                message: text,
                random_id: 0
            }).then(async () => {
                if (!context.isChat) return;
                await Api.replyMessage(context, "Отправил команды в ЛС 😎");
            });
        } catch (e) {
            console.error(`${TAG_ERROR}: help.ts: ${Utils.getExceptionText(e)}`);
            if (e.code == 901) {
                await Api.replyMessage(context, "Разрешите мне писать Вам сообщения 🥺");
            } else {
                await Api.replyMessage(context, "Не смог отправить команды в ЛС ☹");
            }
        }
    }
}