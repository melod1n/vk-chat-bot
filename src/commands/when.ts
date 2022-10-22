/* eslint-disable no-case-declarations */
import {Command} from "../model/chat-command";
import {Utils} from "../util/utils";

export class When extends Command {
    regexp = /^\/(when|когда)\s([^]+)/i;
    title = "/when [value]";
    name = "/when";
    description = "random date";

    async execute(context, params) {
        let text = "через ";

        const type = Utils.getRandomInt(8);

        switch (type) {
        case 0:
            text = "сейчас";
            break;
        case 1:
            text = "никогда";
            break;
        case 2: //seconds
            const seconds = Utils.getRangedRandomInt(1, 60);

            text += `${seconds} `;

            text += (
                (seconds == 1 || seconds % 10 == 1) ? "секунду" :
                    ((seconds > 1 && seconds < 5) || (seconds % 10 > 1 && seconds % 10 < 5)) ? "секунды" : "секунд"
            );
            break;
        case 3:
            const minutes = Utils.getRangedRandomInt(1, 60);

            text += `${minutes} `;

            text += (
                (minutes == 1 || minutes % 10 == 1) ? "минуту" :
                    ((minutes > 1 && minutes < 5) || (minutes % 10 > 1 && minutes % 10 < 5)) ? "минуты" : "минут"
            );
            break;
        case 4:
            const hours = Utils.getRangedRandomInt(1, 24);

            text += `${hours} `;

            text += (
                (hours == 1 || hours % 10 == 1) ? "час" :
                    ((hours > 1 && hours < 5) || (hours % 10 > 1 && hours % 10 < 5)) ? "часа" : "часов"
            );
            break;
        case 5:
            const weeks = Utils.getRangedRandomInt(1, 4);

            text += `${weeks} `;

            text += (weeks == 1 ? "неделю" : "недель");
            break;
        case 6:
            const months = Utils.getRandomInt(12);

            text += `${months} `;

            text += (
                (months == 1 || months % 10 == 1) ? "месяц" :
                    ((months > 1 && months < 5) || (months % 10 > 1 && months % 10 < 5)) ? "месяца" : "месяцев"
            );
            break;
        case 7:
            const years = Utils.getRangedRandomInt(1, 100);

            text += `${years} `;

            text += (
                (years == 1 || years % 10 == 1) ? "год" :
                    ((years > 1 && years < 5) || (years % 10 > 1 && years % 10 < 5)) ? "года" : "лет"
            );
            break;
        }

        await context.reply(text);
    }

}