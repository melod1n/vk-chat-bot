import {Command, Requirement, Requirements} from "../model/chat-command";
import {LoadManager} from "../api/load-manager";
import {Api} from "../api/api";

export class Offline extends Command {
    regexp = /^\/offline/i;
    title = "/offline";
    name = "/offline";
    description = "offline users";

    requirements = Requirements.Build(Requirement.CHAT);

    async execute(context): Promise<void> {
        const waitContext = await Api.sendMessage(context, "секунду...");

        const users = (await LoadManager.chats.loadSingle(context.peerId)).users;
        const allCount = users.length;

        const hiddenOnlineUsers = users.filter((user) => !user.onlineVisible);
        const onlineUsers = users.filter((user) => !user.online);

        let text = `Не в сети (${onlineUsers.length}/${allCount})\n`;

        for (const user of onlineUsers) {
            const sexIcon = `${user.sex == 0 ? "👽" : user.sex == 1 ? "🚺" : "🚹"}`;
            const platform = user.onlineMobile ? "📱" : "💻";
            const name = `@id${user.id}(${user.firstName} ${user.lastName})`;
            const sex = `был${user.sex == 1 ? "а" : user.sex == 0 ? "о" : ""}`;
            const time = `${!user.onlineVisible ? "" : `${new Date(user.lastSeen * 1000).toLocaleString()}`}`;

            text += `${sexIcon} ${platform} ${name} ${time === "" ? "" : sex} ${time}\n`;
        }

        if (onlineUsers.length == 0) text = "Все онлайн 😀";
        if (hiddenOnlineUsers.length > 0) {
            text += `\n(Пользователей, скрывших онлайн: ${hiddenOnlineUsers.length})`;
        }

        await Api.editMessage(waitContext, text);
    }
}