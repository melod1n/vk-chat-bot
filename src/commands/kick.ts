import {Command, Requirement, Requirements} from "../model/chat-command";
import {Api} from "../api/api";
import {LoadManager} from "../api/load-manager";

export class Kick extends Command {
    regexp = /^\/kick/i;
    title = "/kick [reply]";
    name = "/kick";
    description = "kicks user from chat";

    requirements = Requirements.Build(
        Requirement.CHAT,
        Requirement.BOT_CHAT_ADMIN,
        Requirement.REPLY,
        Requirement.BOT_ADMIN
    );

    async execute(context) {
        const message = await LoadManager.messages.loadByConversationMessageId(
            context.peerId,
            context.replyMessage.conversationMessageId
        );

        if (Math.abs(message.fromId) === globalThis.id) {
            console.log(`${this.title}: fromId is bad`);

            await Api.replyMessage(context, "Нет.");
            return;
        }

        await Api.removeChatUser(context.chatId, message.fromId).catch(console.error);
    }

}