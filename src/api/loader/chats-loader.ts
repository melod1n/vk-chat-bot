import {Loader} from '../../model/loader';
import {VkChat} from '../../model/vk-chat';
import {vk} from '../../index';
import {VkUser} from '../../model/vk-user';
import {CacheStorage} from '../../database/cache-storage';
import {MemoryCache} from '../../database/memory-cache';

export class ChatsLoader extends Loader<VkChat> {

    async load(peersIds: number[]): Promise<VkChat[]> {
        if (peersIds.length == 0) return null;

        return new Promise(async (resolve, reject) => {
            try {
                const jsonChats =
                    (await vk.api.call('messages.getConversationsById', {
                        peer_ids: peersIds.join(',')
                    })).items;

                const chats: VkChat[] = [];
                const users: VkUser[] = [];

                for (const c of jsonChats) {
                    const chat = new VkChat(c);
                    const membersIds = [];
                    const members: VkUser[] = [];

                    const jsonMembers = await vk.api.call('messages.getConversationMembers',
                        {
                            peer_id: chat.id,
                            fields: 'photo200, online, online_mobile, online_info, sex'
                        }
                    );

                    VkUser.parse(jsonMembers.profiles).forEach(e => {
                        users.push(e);
                        members.push(e);
                    });

                    members.forEach(user => membersIds.push(user.id));

                    chat.users = users;
                    chat.usersIds = membersIds;
                    chats.push(chat);
                }

                resolve(chats);

                chats.forEach(chat => MemoryCache.appendChat(chat));
                users.forEach(user => MemoryCache.appendUser(user));

                const usersPromise = CacheStorage.users.store(users);
                const chatsPromise = CacheStorage.chats.store(chats);

                await Promise.all([usersPromise, chatsPromise]);
            } catch (e) {
                reject(e);
            }
        });
    }

    async loadSingle(peerId: number): Promise<VkChat> {
        return new Promise((resolve, reject) =>
            this.load([peerId]).then(chats => resolve(chats[0])).catch(reject));
    }

}