import {Command} from "../model/chat-command";
import {Api} from "../api/api";

export class Ping extends Command {
    regexp = /^\/ping/i;
    title = "/ping";
    description = "bot's ping";

    async execute(context) {
        const startTime = Date.now();

        const waitContext = await context.send("pong");

        const nowMillis = Date.now();

        const change = Math.abs(nowMillis - startTime);

        await Api.editMessage(context.peerId, waitContext.conversationMessageId, `ping: ~${change} ms`);
    }


}