import {Command} from "../model/chat-command";
import {Utils} from "../util/utils";

export class Stats extends Command {
    regexp = /^\/stats/i;
    title = "/stats";
    description = "bot's stats";

    async execute(context) {
        let text = "Статистика бота.\n\n";

        text += `⏳ Время работы: ${Utils.getUptime()}\n`;

        await context.send(text);
    }
}