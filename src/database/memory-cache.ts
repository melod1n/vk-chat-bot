import {VkUser} from '../model/vk-user';
import {VkChat} from '../model/vk-chat';

export class MemoryCache {

    static users: VkUser[] = [];
    static chats: VkChat[] = [];
    static admins: number[] = [];

    static appendUser(user: VkUser) {
        this.users.push(user);
    }

    static appendChat(chat: VkChat) {
        this.chats.push(chat);
    }

    static appendAdmin(adminId: number) {
        this.admins.push(adminId);
    }

    static clear() {
        this.users = [];
        this.chats = [];
        this.admins = [];
    }

    static includesUser(user: VkUser): boolean {
        for (let i = 0; i < this.users.length; i++) {
            const storedUser = this.users[i];
            if (user.id == storedUser.id) return true;
        }

        return false;
    }

    static includesChat(chat: VkChat): boolean {
        for (let i = 0; i < this.chats.length; i++) {
            const storedChat = this.chats[i];
            if (chat.peerId == storedChat.peerId) return true;
        }

        return false;
    }

}