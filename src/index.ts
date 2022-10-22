/* eslint-disable @typescript-eslint/no-inferrable-types,no-async-promise-executor */
import "reflect-metadata";
import {MessageContext, VK} from "vk-io";
import {Utils} from "./util/utils";
import {Command, Requirement, Requirements} from "./model/chat-command";
import {StorageManager} from "./database/storage-manager";
import {Api} from "./api/api";
import {Help} from "./commands/help";
import {About} from "./commands/about";
import {Kick} from "./commands/kick";
import {LoadUser} from "./commands/load-user";
import {Ping} from "./commands/ping";
import {Random} from "./commands/random";
import {RandomString} from "./commands/random-string";
import {Reboot} from "./commands/reboot";
import {Shutdown} from "./commands/shutdown";
import {Stats} from "./commands/stats";
import {SystemSpecs} from "./commands/system-specs";
import {Test} from "./commands/test";
import {Title, UserTitle} from "./commands/title";
import {Uptime} from "./commands/uptime";
import {WhatBetter} from "./commands/what-better";
import {When} from "./commands/when";
import {Who} from "./commands/who";
import {Bat} from "./commands/bat";
import {CacheStorage} from "./database/cache-storage";
import {LoadManager} from "./api/load-manager";
import * as dotenv from "dotenv";
import {JsonRequest} from "./commands/json-request";
import {MemoryCache} from "./database/memory-cache";
import {Online} from "./commands/online";
import {Offline} from "./commands/offline";
import {AdminAdd, AdminRemove, AdminsList} from "./commands/admins";
import {NoteAdd} from "./commands/notes";
import {DatabaseManager} from "./database/database-manager";
import {Database} from "sqlite3";
import {GroupsGroupFull} from "vk-io/lib/api/schemas/objects";

export const TAG = "[VKBot]";
export const TAG_ERROR = `${TAG} [ERROR]`;

dotenv.config();

const findAndKickUnAllowedMembers = true;

export const creatorId = Number(process.env["CREATOR_ID"]);
export let currentGroupId: number = -1;
const mainChatId = Number(process.env["MAIN_CHAT_ID"]);

const isDebug = Boolean(process.env.DEBUG);
console.log(`isDebug: ${isDebug}`);

export const vk = new VK({
    token: process.env[isDebug ? "DEBUG_TOKEN" : "TOKEN"]
});

console.log(vk.api.options.apiVersion);

//for /ae command   
globalThis.vk = vk;
globalThis.cache = CacheStorage;
globalThis.memory = MemoryCache;
globalThis.loader = LoadManager;
globalThis.storage = StorageManager;

(async () => {
    const groupIdResponse: GroupsGroupFull[] = await vk.api.call("groups.getById", {});
    currentGroupId = groupIdResponse[0].id;

    const intervalFunction = async () => {
        const updateGroupDescriptionPromise = updateGroupDescription();
        const checkUnAllowedMembersPromise = checkUnAllowedMembers();

        await Promise.all([updateGroupDescriptionPromise, checkUnAllowedMembersPromise]);
    };

    await intervalFunction();
    setInterval(intervalFunction, 5000 * 60);

    await setupDatabase();
})();

async function updateGroupDescription() {
    await vk.api.call("groups.edit", {
        group_id: currentGroupId,
        description: `Last update: ${new Date()}`
    }).catch(console.error);
}

vk.updates.on("message_new", async (context) => {
    if (context.isOutbox) return;

    const cmd = await searchCommand(context);
    if (!cmd) return;

    const requirements = cmd.requirements;

    if (requirements.isRequiresBotCreator() && context.senderId !== creatorId) {
        console.log(`${cmd.title}: creatorId is bad`);
        await context.reply("Вы не являетесь создателем бота.");
        return;
    }

    if (requirements.isRequiresBotAdmin() && (!MemoryCache.includesAdmin(context.senderId) && context.senderId !== creatorId)) {
        console.log(`${cmd.title}: adminId is bad`);
        await context.reply("Вы не являетесь администратором бота.");
        return;
    }

    if (requirements.isRequiresBotChatAdmin() && context.isChat) {
        let chat = await MemoryCache.getChat(context.peerId);
        if (!chat) {
            chat = await LoadManager.chats.loadSingle(context.peerId);
        }

        if (!chat || !chat.admins.includes(-Math.abs(currentGroupId))) {
            console.log(`${cmd.title}: chatAdminId is bad`);
            await context.reply("Бот не является администратором чата.");
            return;
        }
    }

    if (requirements.isRequiresChat() && !context.isChat) {
        console.log(`${cmd.title}: chatId is bad`);
        await context.reply("Тут Вам не чат.");
        return;
    }

    if (requirements.isRequiresForwards() && !context.hasForwards) {
        console.log(`${cmd.title}: forwards is bad`);
        await context.reply("Отсутствуют пересланные сообщения.");
        return;
    }

    if (requirements.isRequiresReply() && !context.hasReplyMessage) {
        console.log(`${cmd.title}: replyMessage is bad`);
        await context.reply("Отсутствует ответ на сообщение.");
        return;
    }

    const executeCommandPromise = cmd.execute(
        context,
        context.text.match(cmd.regexp),
        context.forwards,
        context.replyMessage
    );

    const loadChatPromise = LoadManager.chats.loadSingle(context.peerId);
    const loadUserPromise = LoadManager.users.loadSingle(context.senderId);

    await Promise.all([executeCommandPromise, loadChatPromise, loadUserPromise]);
});

export async function checkUnAllowedMembers(): Promise<boolean> {
    if (!findAndKickUnAllowedMembers) return false;
    const chatMembers = await vk.api.messages.getConversationMembers({peer_id: 2000000000 + mainChatId});
    const chatMembersIds = chatMembers.items.map(m => m.member_id);
    const membersToKick = [];

    chatMembersIds.forEach(memberId => {
        if (StorageManager.allowedIds.indexOf(memberId) == -1) {
            membersToKick.push(memberId);
        }
    });

    if (membersToKick.length == 0) return false;

    for (const memberId of membersToKick) {
        setTimeout(async () => {
            await vk.api.messages.removeChatUser({chat_id: mainChatId, member_id: memberId}).catch(console.error);
        }, 500);
    }

    return true;
}

vk.updates.on(["chat_invite_user", "chat_invite_user_by_link"], async (context) => {
    if (await checkUnAllowedMembers()) {
        return;
    }
    await sendInviteUserMessage(context);
});

vk.updates.on("chat_kick_user", async (context) => {
    await sendKickUserMessage(context);
});

vk.updates.start().catch(console.error).then(async () => {
    const msg = "bot is ready ;)";
    console.log(msg);
});

export class Ae extends Command {
    regexp = /^\/ae\s([^]+)/i;
    title = "/ae [value]";
    name = "/ae";
    description = "js eval";

    requirements = Requirements.Create(Requirement.BOT_CREATOR);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(context, params, fwd, reply) {
        const match = params[1];

        try {
            let e = eval(match);
            e = ((typeof e == "string") ? e : JSON.stringify(e));

            await Api.sendMessage(context, e);
        } catch (e) {
            const text = e.message;

            if (text.includes("is not defined")) {
                await Api.sendMessage(context, "variable is not defined");
                return;
            }

            console.error(`${text}
                * Stacktrace: ${e.stack}`);

            await Api.sendMessage(context, text);
        }
    }
}

// eslint-disable-next-line prefer-const
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

commands.sort(Utils.compareCommands);

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

async function sendInviteUserMessage(context: MessageContext): Promise<unknown> {
    if (context.eventMemberId < 0) return;

    return new Promise((resolve, reject) => {
        Api.sendMessage(
            context,
            `@id${context.eventMemberId}(${StorageManager.answers.inviteAnswers[Utils.getRandomInt(StorageManager.answers.inviteAnswers.length)]})`
        ).catch(reject).then(resolve);
    });
}

async function sendKickUserMessage(context: MessageContext): Promise<unknown> {
    if (context.eventMemberId < 0) return;

    return new Promise((resolve, reject) => {
        Api.sendMessage(
            context,
            `@id${context.eventMemberId}(${StorageManager.answers.kickAnswers[Utils.getRandomInt(StorageManager.answers.kickAnswers.length)]})`
        ).catch(reject).then(resolve);
    });
}

async function setupDatabase() {
    const db = new Database(`data/${isDebug ? "database_debug.sqlite" : "database.sqlite"}`);

    await DatabaseManager.create(db).init();
    CacheStorage.init();

    await fillMemoryCache();
    await updateChats();
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
    return new Promise(async (resolve) => {
            const chats = await CacheStorage.chats.get();

            if (chats.length == 0) {
                resolve();
                return;
            }

            const chatsIds: number[] = [];
            chats.forEach(chat => chatsIds.push(chat.id));

            if (chatsIds.indexOf(0) != -1) {
                throw Error("chatsIds list contains zero value");
            }

            const loadedChats = await LoadManager.chats.load(chatsIds);
            loadedChats.forEach(chat => MemoryCache.appendChat(chat));

            console.log(`${TAG}: cached chats updated`);
        }
    );
}