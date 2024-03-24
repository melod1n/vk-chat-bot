import {Command} from "../model/chat-command";
import {Api} from "../api/api";

export class Ping extends Command {
    regexp = /^\/ping/i;
    title = "/ping";
    description = "bot's ping";

    async execute(context) {
        const startTime = Date.now();

        const waitContext = await Api.sendMessage(context, "pong");

        const nowMillis = Date.now();

        const change = Math.abs(nowMillis - startTime);

        await Api.editMessage(waitContext, `ping: ~${change} ms`);
    }
}