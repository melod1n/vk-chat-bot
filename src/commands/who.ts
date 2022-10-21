import {Command, Requirement, Requirements} from "../model/chat-command";
import {LoadManager} from "../api/load-manager";
import {Utils} from "../util/utils";
import {Api} from "../api/api";
import {StorageManager} from "../database/storage-manager";
import {MemoryCache} from "../database/memory-cache";
import {MessageContext} from "vk-io";

export class Who extends Command {
    regexp = /^\/(who|кто)\s([^]+)/i;
    title = "/who [value]";
    description = "random people from chat's participants (only users)";

    requirements = Requirements.Create(Requirement.CHAT, Requirement.BOT_CHAT_ADMIN);

    async execute(context) {
        let waitContext: MessageContext | null = null;

        let chat = await MemoryCache.getChat(context.peerId);

        if (!chat) {
            waitContext = await context.send("секунду");
            chat = await LoadManager.chats.loadSingle(context.peerId);
        }

        const userId = chat.usersIds[Utils.getRandomInt(chat.usersIds.length)];

        if (!userId) {
            if (waitContext) {
                await Api.editMessage(context.peerId, waitContext.conversationMessageId, "никого не нашёл :(");
            } else {
                await context.reply("никого не нашёл :(");
            }
            return;
        }

        let user = await MemoryCache.getUser(userId);
        if (!user) {
            if (!waitContext) waitContext = context.send("секунду...");
            user = await LoadManager.users.loadSingle(userId);
        }

        const text = `@id${userId}(${user.firstName} ${user.lastName})`;

        const spl = context.text.trim().split(" ");
        spl[0] = "";

        const v = spl.join(" ");

        const index = Utils.getRandomInt(StorageManager.answers.whoAnswers.length);

        const whoText = `${StorageManager.answers.whoAnswers[index]} ${v} — ${text}`;

        if (waitContext) {
            await Api.editMessage(context.peerId, waitContext.conversationMessageId, whoText);
        } else {
            await context.send(whoText);
        }
    }
}