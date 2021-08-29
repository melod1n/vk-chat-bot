import {TAG, vk} from '../index';
import {CacheStorage} from '../database/cache-storage';
import {User} from '../model/user';
import {Chat} from '../model/chat';
import {Message} from '../model/message';
import {mem} from 'systeminformation';
import {Utils} from '../util/utils';

class UsersLoader {

    async load(userIds: string): Promise<User[]> {
        if (!userIds || userIds.length == 0) return null;

        return new Promise((resolve, reject) => {
            vk.api.users.get({
                user_ids: userIds,
                fields: ['photo_50', 'photo_100', 'photo_200', 'status', 'screen_name', 'online', 'last_seen', 'verified', 'sex']
            }).catch(reject).then(async (r) => {
                const users = User.parse(r);
                resolve(users);

                await CacheStorage.users.store(users);
            });
        });
    }

    async loadSingle(userId: number): Promise<User> {
        return new Promise((resolve, reject) =>
            this.load(Utils.numbersToString([userId])).then(users => resolve(users[0])).catch(reject));
    }

}

class ChatsLoader {

    async load(peerIds: string): Promise<Chat[]> {
        if (!peerIds || peerIds.length == 0) return null;

        return new Promise(async (resolve, reject) => {
            try {
                const jsonChats = (await vk.api.call('messages.getConversationsById', {peer_ids: peerIds})).items;
                console.log(`${TAG}: messages.getConversationsById`);

                const chats: Chat[] = [];
                const users: User[] = [];

                for (const c of jsonChats) {
                    const chat = new Chat(c);
                    const membersIds = [];
                    const members: User[] = [];

                    const jsonMembers = await vk.api.call('messages.getConversationMembers', {peer_id: chat.peerId});
                    console.log(`${TAG}: messages.getConversationsMembers`);

                    User.parse(jsonMembers.profiles).forEach(e => {
                        users.push(e);
                        members.push(e);
                    });

                    members.forEach(user => membersIds.push(user.userId));

                    chat.users = membersIds;
                    chats.push(chat);
                }

                resolve(chats);

                const usersPromise = CacheStorage.users.store(users);
                const chatsPromise = CacheStorage.chats.store(chats);

                await Promise.all([usersPromise, chatsPromise]);
            } catch (e) {
                reject(e);
            }
        });
    }

    async loadSingle(peerId: number): Promise<Chat> {
        return new Promise((resolve, reject) =>
            this.load(Utils.numbersToString([peerId])).then(chats => resolve(chats[0])).catch(reject));
    }

}

class MessagesLoader {

    async loadByConversationMessageId(peerId: number, conversationMessageId: number): Promise<Message> {
        return new Promise((resolve, reject) => {
            vk.api.messages.getByConversationMessageId({
                peer_id: peerId,
                conversation_message_ids: conversationMessageId
            }).catch(reject).then(r => {
                // @ts-ignore
                const message = Message.parse(r.items)[0];
                resolve(message);
            });
        });
    }

}

export class LoadManager {

    static users = new UsersLoader();
    static chats = new ChatsLoader();
    static messages = new MessagesLoader();

}