import {Command} from "../model/chat-command";
import {TAG_ERROR, vk} from "../index";
import {StorageManager} from "../database/storage-manager";
import {Utils} from "../util/utils";
import {Api} from "../api/api";
import {BOT_VERSION} from "../common/constants";
import { MessageContext, ContextDefaultState } from "vk-io";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dependencies = require("./../../package.json").dependencies;

export class About extends Command {
    regexp = /^\/about/i;
    title = "/about";
    description = "information about this bot";

    async execute(context: MessageContext) {
        const depsKeys = Object.keys(dependencies);
        const depsValues = [];
        depsKeys.forEach(key => {
            depsValues.push(dependencies[key]);
        });

        let aboutText = `\nВерсия бота: ${BOT_VERSION}`;

        aboutText += `\n\nVK API v. ${vk.api.options.apiVersion}`;

        aboutText += "\n\nОтветы: \n";
        aboutText += `* Тест: ${StorageManager.answers.testAnswers.length} ответов\n`;
        aboutText += `* Инвайт: ${StorageManager.answers.inviteAnswers.length} ответов\n`;
        aboutText += `* Кик: ${StorageManager.answers.kickAnswers.length} ответов\n`;
        aboutText += `* Кто: ${StorageManager.answers.whoAnswers.length} ответов\n`;
        aboutText += `* Что лучше: ${StorageManager.answers.betterAnswers.length} ответов\n`;

        aboutText += "\n";

        aboutText += "Зависимости: \n";

        for (let i = 0; i < depsKeys.length; i++) {
            aboutText += `* ${depsKeys[i]} ${depsValues[i]}\n`;
        }

        aboutText += "\n\nСоздатель: @melod1n";

        try {
            await vk.api.messages.send({
                peer_id: context.senderId,
                message: aboutText,
                random_id: 0,
                disable_mentions: true
            }).then(async () => {
                if (!context.isChat) return;
                await Api.replyMessage(context, "Отправил информацию в ЛС 😎");
            });
        } catch (e) {
            console.error(`${TAG_ERROR}: about.ts: ${Utils.getExceptionText(e)}`);
            if (e.code == 901) {
                await Api.replyMessage(context, "Разрешите мне писать Вам сообщения 🥺");
            } else {
                await Api.replyMessage(context, "Не смог отправить информацию в ЛС ☹");
            }
        }
    }
}