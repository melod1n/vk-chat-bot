import {MessageContext, VK} from 'vk-io';
import {Utils} from './util/utils';
import {database} from './database/database';
import {Command} from './model/chat-command';
import {inviteAnswers, kickAnswers, settings, SettingsStorage} from './database/settings-storage';
import {Api} from './api/api';
import {Help} from './commands/help';
import {About} from './commands/about';
import {Admins} from './commands/admins';
import {Ae} from './commands/ae';
import {Kick} from './commands/kick';
import {LoadUser} from './commands/load-user';
import {Ping} from './commands/ping';
import {Random} from './commands/random';
import {RandomString} from './commands/random-string';
import {Reboot} from './commands/reboot';
import {Shutdown} from './commands/shutdown';
import {Stats} from './commands/stats';
import {SystemSpecs} from './commands/system-specs';
import {Test} from './commands/test';
import {Title} from './commands/title';
import {Uptime} from './commands/uptime';
import {UserTitle} from './commands/user-title';
import {WhatBetter} from './commands/what-better';
import {When} from './commands/when';
import {Who} from './commands/who';
import {Bat} from './commands/bat';
import {Chat} from './model/chat';
import {CacheStorage} from './database/cache-storage';
import {LoadManager} from './api/load-manager';

export const creatorId = yourIdHere
export const isDebug = true;
export let currentGroupId: number = -1;

export let currentSentMessages: number = 0;
export let currentReceivedMessages: number = 0;

export function increaseSentMessages() {
    currentSentMessages++;
    SettingsStorage.increaseSentMessagesCount().then();
}

export function increaseReceivedMessages() {
    currentReceivedMessages++;
    SettingsStorage.increaseReceivedMessagesCount().then();
}

setup();

let startMessage = !isDebug;

export let vk = new VK({
    token: tokenHere
});

globalThis.vk = vk;

console.log(`debug: ${isDebug}`);

vk.api.groups.getById({}).catch(console.error).then((r) => {
    //@ts-ignore
    currentGroupId = r[0].id;
    globalThis.id = currentGroupId;
});

vk.updates.on(['chat_invite_user', 'chat_invite_user_by_link'], async (context) => {
    await sendInviteUserMessage(context);
});

vk.updates.on('chat_kick_user', async (context) => {
    await sendKickUserMessage(context);
});

vk.updates.on('message_new', async (context) => {
    if (context.isOutbox) return;

    let chat: Chat = null;

    if (context.isChat) {
        chat = await CacheStorage.getChat(context.peerId);
        if (!chat && context.isChat) chat = await LoadManager.loadChat(context.peerId);
        else LoadManager.loadChat(context.peerId).then(c => chat = c);
    }

    increaseReceivedMessages();

    try {
        const cmd = searchCommand(context);
        if (cmd) {
            const requirements = cmd.requirements;

            if (requirements.creatorOnly && context.senderId !== creatorId) {
                console.log(`${cmd.name || cmd.title}: creatorId is bad`);
                await context.reply('Вы не являетесь создателем бота.');
                return;
            }

            if (requirements.requireAdmin && (!database.admins.includes(context.senderId) && context.senderId !== creatorId)) {
                console.log(`${cmd.name || cmd.title}: adminId is bad`);
                await context.reply('Вы не являетесь администратором бота.');
                return;
            }

            if (chat && requirements.requireChatAdmin && !chat.admins.includes(-Math.abs(currentGroupId))) {
                console.log(`${cmd.name || cmd.title}: chatAdminId is bad`);
                await context.reply('Бот не является администратором чата.');
                return;
            }

            if (requirements.requireChat && !context.isChat) {
                console.log(`${cmd.name || cmd.title}: chatId is bad`);
                await context.reply('Тут Вам не чат.');
                return;
            }

            if (requirements.requireForwards && !context.hasForwards) {
                console.log(`${cmd.name || cmd.title}: forwards is bad`);
                await context.reply('Отсутствуют пересланные сообщения.');
                return;
            }

            if (requirements.requireReply && !context.hasReplyMessage) {
                console.log(`${cmd.name || cmd.title}: replyMessage is bad`);
                await context.reply('Отсутствует ответ на сообщение.');
                return;
            }

            await cmd.execute(
                context,
                context.text.match(cmd.regexp),
                context.forwards,
                context.replyMessage
            );
        }
    } catch (e) {
        console.log(Utils.getExceptionText(e));
    }
});

vk.updates.start().catch(console.error).then(async () => {
    const msg = `bot is ready ;)`;

    console.log(msg);

    if (startMessage) {
        vk.api.messages.send({
            peer_id: creatorId,
            message: `${msg}\n debug: ${isDebug}`,
            random_id: 0
        }).catch(console.error);
    }
});

export let commands: Command[] = [
    new About(),
    new Admins(),
    new Bat(),
    new Ae(),
    new Help(),
    new Kick(),
    new LoadUser(),
    new Ping(),
    new Random(),
    new RandomString(),
    new Reboot(),
    new Shutdown(),
    new Stats(),
    new SystemSpecs(),
    new Test(),
    new Title(),
    new Uptime(),
    new UserTitle(),
    new WhatBetter(),
    new When(),
    new Who()
];

function searchCommand(context?: MessageContext, text?: string): Command {
    return commands.find(c => c.regexp.test(context ? context.text : text));
}

async function sendInviteUserMessage(context: MessageContext): Promise<any> {
    if (!settings.sendActionMessage || context.eventMemberId < 0) return;

    return new Promise((resolve, reject) => {
        Api.sendMessage(
            context,
            `@id${context.eventMemberId}(${inviteAnswers[Utils.getRandomInt(inviteAnswers.length)]})`
        ).catch(reject).then(resolve);
    });
}

async function sendKickUserMessage(context: MessageContext): Promise<any> {
    if (!settings.sendActionMessage || context.eventMemberId < 0) return;

    return new Promise((resolve, reject) => {
        Api.sendMessage(
            context,
            `@id${context.eventMemberId}(${kickAnswers[Utils.getRandomInt(kickAnswers.length)]})`
        ).catch(reject).then(resolve);
    });
}

function setup() {
    process.on('uncaughtException', (e) => {
        const errorText = Utils.getExceptionText(e);

        console.error(errorText);

        // vk.api.messages.send({
        //     message: errorText,
        //     peer_id: creatorId,
        //     random_id: Utils.getRandomInt(10000)
        // }).catch(console.error).then(() => console.log('success exception message'));
    });

}