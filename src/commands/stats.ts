import {Command} from "../model/chat-command";
import {Utils} from "../util/utils";
import {Api} from "../api/api";
import {StorageManager} from "../database/storage-manager";
import {MessageContext} from "vk-io";

export let receivedMessagesCount = 0;
export let sentMessagesCount = 0;

export function incrementReceivedMessages() {
    receivedMessagesCount++;
    StorageManager.stats.receivedCount++;
    StorageManager.updateStats();
}

export function incrementSentMessages() {
    sentMessagesCount++;
    StorageManager.stats.sentCount++;
    StorageManager.updateStats();
}

export class Stats extends Command {
    regexp = /^\/stats/i;
    title = "/stats";
    description = "bot's stats";

    async execute(context: MessageContext) {
        let text = "Статистика бота.\n\n";

        text += `⏳ Время работы:\n${Utils.getUptime()}\n\n`;

        text += `📥 Получено сообщений: ${receivedMessagesCount}\n`;
        text += `📤 Отправлено сообщений: ${sentMessagesCount}\n\n`;

        text += `📥 Получено сообщений (всего): ${StorageManager.stats.receivedCount}\n`;
        text += `📤 Отправлено сообщений (всего): ${StorageManager.stats.sentCount}`;

        await Api.sendMessage(context, text);
    }
}