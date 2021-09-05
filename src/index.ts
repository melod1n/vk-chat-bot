import 'reflect-metadata';
import {Container} from 'inversify';
import {InjectManager} from './di/inversify.config';
import {MessageContext, VK} from 'vk-io';
import {Utils} from './util/utils';
import {Command, Requirements} from './model/chat-command';
import {StorageManager} from './database/storage-manager';
import {Api} from './api/api';
import {Help} from './commands/help';
import {About} from './commands/about';
import {Admins} from './commands/admins';
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
import {CacheStorage} from './database/cache-storage';
import {LoadManager} from './api/load-manager';
import * as dotenv from 'dotenv';
import {JsonRequest} from './commands/json-request';
import {AddAdmin} from './commands/add-admin';
import {MemoryCache} from './database/memory-cache';
import {RemoveAdmin} from './commands/remove-admin';
import {Online} from './commands/online';
import {Offline} from './commands/offline';

export const AppContainer = new Container();
InjectManager.init();


dotenv.config();


export const creatorId = parseInt(process.env['CREATOR_ID']);
export let currentGroupId: number = -1;

export const TAG = '[VKBot]';
export const TAG_ERROR = `${TAG} [ERROR]`;

export let vk = new VK({
    token: process.env['TOKEN']
});

setup().then();

//for /ae command
globalThis.vk = vk;
globalThis.cache = CacheStorage;
globalThis.memory = MemoryCache;
globalThis.loader = LoadManager;
globalThis.storage = StorageManager;


vk.api.groups.getById({}).catch(console.error).then((r) => {
    //@ts-ignore
    currentGroupId = r[0].id;
    globalThis.id = currentGroupId;
});

vk.updates.on('message_new', async (context) => {
    if (context.isOutbox) return;

    try {
        const cmd = await searchCommand(context);
        if (cmd) {
            const requirements = cmd.requirements;

            if (requirements.creatorOnly && context.senderId !== creatorId) {
                console.log(`${cmd.name || cmd.title}: creatorId is bad`);
                await context.reply('Вы не являетесь создателем бота.');
                return;
            }

            if (requirements.requireAdmin && (!MemoryCache.admins.includes(context.senderId) &&
                context.senderId !== creatorId)) {
                console.log(`${cmd.name || cmd.title}: adminId is bad`);
                await context.reply('Вы не являетесь администратором бота.');
                return;
            }

            if (requirements.requireChatAdmin && context.isChat) {
                let chat = await CacheStorage.chats.getSingle(context.peerId);
                if (!chat) chat = await LoadManager.chats.loadSingle(context.peerId);

                if (!chat.admins.includes(-Math.abs(currentGroupId))) {
                    console.log(`${cmd.name || cmd.title}: chatAdminId is bad`);
                    await context.reply('Бот не является администратором чата.');
                    return;
                }
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

        const increasePromise = StorageManager.increaseReceivedMessagesCount();
        const checkChatPromise = CacheStorage.chats.checkIfStored(context.peerId);
        const checkUserPromise = CacheStorage.users.checkIfStored(context.senderId);

        await Promise.all([increasePromise, checkChatPromise, checkUserPromise]);
    } catch (e) {
        console.log(`${TAG_ERROR}: ${Utils.getExceptionText(e)}`);
    }
});

vk.updates.on(['chat_invite_user', 'chat_invite_user_by_link'], async (context) => {
    await sendInviteUserMessage(context);
});

vk.updates.on('chat_kick_user', async (context) => {
    await sendKickUserMessage(context);
});

vk.updates.start().catch(console.error).then(async () => {
    const msg = `bot is ready ;)`;
    console.log(msg);
});

class Ae extends Command {
    regexp = /^\/ae\s([^]+)/i;
    title = '/ae [value]';
    name = '/ae';
    description = 'js eval';

    requirements = Requirements.builder().apply(true);

    async execute(context, params, fwd, reply) {
        const match = params[1];

        try {
            let e = eval(match);
            e = ((typeof e == 'string') ? e : JSON.stringify(e));

            await Api.sendMessage(context, e);
        } catch (e) {
            const text = e.message;

            if (text.includes('is not defined')) {
                await Api.sendMessage(context, 'variable is not defined');
                return;
            }

            console.error(`${text}
                * Stacktrace: ${e.stack}`);

            await Api.sendMessage(context, text);
        }
    }

}

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
    new Who(),
    new JsonRequest(),
    new AddAdmin(),
    new RemoveAdmin(),
    new Online(),
    new Offline()
];

sortCommands();

function sortCommands() {
    commands.sort(Utils.compareCommands);
}

async function searchCommand(context?: MessageContext, text?: string): Promise<Command | null> {
    return new Promise<Command>((resolve => {
        for (let i = 0; i < commands.length; i++) {
            const c = commands[i];
            if (c.regexp.test(context ? context.text : text)) {
                return resolve(c);
            }
        }

        resolve(null);
    }));
}

async function sendInviteUserMessage(context: MessageContext): Promise<any> {
    if (!StorageManager.settings.sendActionMessage || context.eventMemberId < 0) return;

    return new Promise((resolve, reject) => {
        Api.sendMessage(
            context,
            `@id${context.eventMemberId}(${StorageManager.answers.inviteAnswers[Utils.getRandomInt(StorageManager.answers.inviteAnswers.length)]})`
        ).catch(reject).then(resolve);
    });
}

async function sendKickUserMessage(context: MessageContext): Promise<any> {
    if (!StorageManager.settings.sendActionMessage || context.eventMemberId < 0) return;

    return new Promise((resolve, reject) => {
        Api.sendMessage(
            context,
            `@id${context.eventMemberId}(${StorageManager.answers.kickAnswers[Utils.getRandomInt(StorageManager.answers.kickAnswers.length)]})`
        ).catch(reject).then(resolve);
    });
}

async function setup() {
    process.on('uncaughtException', (e) => {
        const errorText = Utils.getExceptionText(e);

        console.error(`${TAG_ERROR}: ${errorText}`);
    });

    await Promise.all([
        fillMemoryCache(),
        updateChats()
    ]);
}

async function fillMemoryCache() {
    MemoryCache.clear();

    const chats = await CacheStorage.chats.get();
    const users = await CacheStorage.users.get();
    // const admins = await cacheStorage.admins.get();

    chats.forEach(c => MemoryCache.appendChat(c));
    users.forEach(u => MemoryCache.appendUser(u));
    // admins.forEach(a => MemoryCache.appendAdmin(a));
}

async function updateChats(): Promise<void> {
    return new Promise((async (resolve) => {
            const chats = await CacheStorage.chats.get();

            if (chats.length == 0) {
                resolve();
                return;
            }

            const chatsIds: number[] = [];
            chats.forEach(chat => chatsIds.push(chat.peerId));

            await LoadManager.chats.load(chatsIds);
            await fillMemoryCache();

            console.log(`${TAG}: cached chats updated`);
        }
    ));
}