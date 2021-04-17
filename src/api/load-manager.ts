import {vk} from '../index';
import {CacheStorage} from '../database/cache-storage';
import {User} from '../model/user';
import {Chat} from '../model/chat';
import {Message} from '../model/message';

export class LoadManager {

    static async loadUser(userId: number): Promise<User> {
        return new Promise((resolve, reject) => {
            vk.api.users.get({
                user_ids: userId.toString(),
                fields: ['photo_50', 'photo_100', 'photo_200', 'status', 'screen_name', 'online', 'last_seen', 'verified', 'sex']
            }).catch(reject).then(r => {
                const user = new User(r[0]);
                resolve(user);

                CacheStorage.storeUser(user);
            });
        });
    }

    static async loadMessageByConversationMessageId(peerId: number, conversationMessageId: number): Promise<Message> {
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

    static async loadChat(peerId: number): Promise<Chat> {
        return new Promise((resolve, reject) => {
            vk.api.call('messages.getConversationsById', {peer_ids: peerId}).catch(reject).then(chats => {
                const chat = Chat.parse(chats.items)[0];

                vk.api.call('messages.getConversationMembers', {peer_id: peerId}).catch(reject).then(r => {
                    const members = User.parse(r.profiles);
                    const membersIds = [];

                    members.forEach(user => membersIds.push(user.userId));

                    chat.users = membersIds;

                    resolve(chat);

                    CacheStorage.storeUsers(members);
                    CacheStorage.storeChat(chat);
                });
            });
        });
    }

}