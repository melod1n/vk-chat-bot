import {Command} from "../model/chat-command";
import {Api} from "../api/api";
import {Utils} from "../util/utils";

export class Uptime extends Command {
    regexp = /^\/uptime/i;
    title = "/uptime";
    description = "bot's uptime";

    async execute(context) {
        await Api.sendMessage(context, Utils.getUptime());
    }

}