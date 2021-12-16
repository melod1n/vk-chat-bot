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
import {Title, UserTitle} from './commands/title';
import {Uptime} from './commands/uptime';
import {WhatBetter} from './commands/what-better';
import {When} from './commands/when';
import {Who} from './commands/who';
import {Bat} from './commands/bat';
import {CacheStorage} from './database/cache-storage';
import {LoadManager} from './api/load-manager';
import * as dotenv from 'dotenv';
import {JsonRequest} from './commands/json-request';
import {MemoryCache} from './database/memory-cache';
import {Online} from './commands/online';
import {Offline} from './commands/offline';
import {AdminAdd, AdminRemove, AdminsList} from './commands/admins';
import {NoteAdd} from './commands/notes';
import {DatabaseManager, setDatabase} from './database/database-manager';
import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import {GroupsGroupFull} from 'vk-io/lib/api/schemas/objects';

export const AppContainer = new Container();
InjectManager.init();

// export const databaseManager = new DatabaseManager();

dotenv.config();

export const creatorId = Number(process.env['CREATOR_ID']);
export let currentGroupId: number = -1;

export const TAG = '[VKBot]';
export const TAG_ERROR = `${TAG} [ERROR]`;

export let vk = new VK({
    token: process.env['TOKEN'],
});

console.log(vk.api.options.apiVersion);

//for /ae command   
globalThis.vk = vk;
globalThis.cache = CacheStorage;
globalThis.memory = MemoryCache;
globalThis.loader = LoadManager;
globalThis.storage = StorageManager;

(async () => {
    const retrieveGroupId = vk.api.call('groups.getById', {});
    const setupPromise = setup();

    const data = await Promise.all([retrieveGroupId, setupPromise]);

    const groupIdResponse: GroupsGroupFull[] = data[0];
    currentGroupId = groupIdResponse[0].id;

    setInterval(async () => {

        await updateGroupDescription();
    }, 5000 * 60);
})();

async function updateGroupDescription() {
    await vk.api.call('groups.edit', {
        group_id: currentGroupId,
        description: `Last update: ${new Date()}`
    }).catch(console.error);
}

vk.updates.on('message_new', async (context) => {
    if (context.isOutbox) return;

    const cmd = await searchCommand(context);
    if (!cmd) return;

    const requirements = cmd.requirements;

    if (requirements.requireBotCreator && context.senderId !== creatorId) {
        console.log(`${cmd.title}: creatorId is bad`);
        await context.reply('Вы не являетесь создателем бота.');
        return;
    }

    if (requirements.requireBotAdmin && (!MemoryCache.includesAdmin(context.senderId) && context.senderId !== creatorId)) {
        console.log(`${cmd.title}: adminId is bad`);
        await context.reply('Вы не являетесь администратором бота.');
        return;
    }

    if (requirements.requireChatAdmin && context.isChat) {
        let chat = await MemoryCache.getChat(context.peerId);
        if (!chat) chat = await LoadManager.chats.loadSingle(context.peerId);

        if (!chat.admins.includes(-Math.abs(currentGroupId))) {
            console.log(`${cmd.title}: chatAdminId is bad`);
            await context.reply('Бот не является администратором чата.');
            return;
        }
    }

    if (requirements.requireChat && !context.isChat) {
        console.log(`${cmd.title}: chatId is bad`);
        await context.reply('Тут Вам не чат.');
        return;
    }

    if (requirements.requireForwards && !context.hasForwards) {
        console.log(`${cmd.title}: forwards is bad`);
        await context.reply('Отсутствуют пересланные сообщения.');
        return;
    }

    if (requirements.requireReply && !context.hasReplyMessage) {
        console.log(`${cmd.title}: replyMessage is bad`);
        await context.reply('Отсутствует ответ на сообщение.');
        return;
    }

    const executeCommandPromise = cmd.execute(
        context,
        context.text.match(cmd.regexp),
        context.forwards,
        context.replyMessage
    );

    const increasePromise = StorageManager.increaseReceivedMessagesCount();
    const loadChatPromise = LoadManager.chats.loadSingle(context.peerId);
    const loadUserPromise = LoadManager.users.loadSingle(context.senderId);

    await Promise.all([executeCommandPromise, increasePromise, loadChatPromise, loadUserPromise]);
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

    requirements = Requirements.Build().apply(true);

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
    new AdminsList(),
    new AdminAdd(),
    new AdminRemove(),
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
    new UserTitle(),
    new Uptime(),
    new WhatBetter(),
    new When(),
    new Who(),
    new JsonRequest(),
    new Online(),
    new Offline(),
    new NoteAdd()
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
    const db = await open({driver: sqlite3.Database, filename: 'data/database.sqlite'});
    setDatabase(db);
    await (new DatabaseManager(db)).init();
    // await databaseManager.init();

    // process.on('uncaughtException', (e) => {
    //     const errorText = Utils.getExceptionText(e);
    //
    //     console.error(`${TAG_ERROR}: ${errorText}`);
    // });

    await Promise.all([
        fillMemoryCache(),
        updateChats()
    ]);
}

async function fillMemoryCache() {
    MemoryCache.clear();

    const chatsPromise = CacheStorage.chats.get();
    const usersPromise = CacheStorage.users.get();
    const adminsPromise = CacheStorage.admins.get();

    const data = await Promise.all([chatsPromise, usersPromise, adminsPromise]);

    data[0].forEach(c => MemoryCache.appendChat(c));
    data[1].forEach(u => MemoryCache.appendUser(u));
    data[2].forEach(a => MemoryCache.appendAdmin(a));
}

async function updateChats(): Promise<void> {
    return new Promise((async (resolve) => {
            const chats = await CacheStorage.chats.get();

            if (chats.length == 0) {
                resolve();
                return;
            }

            const chatsIds: number[] = [];
            chats.forEach(chat => chatsIds.push(chat.id));

            await LoadManager.chats.load(chatsIds);
            await fillMemoryCache();

            console.log(`${TAG}: cached chats updated`);
        }
    ));
}