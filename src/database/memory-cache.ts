import {User} from '../model/user';
import {Chat} from '../model/chat';

export class MemoryCache {

    static users: User[] = [];
    static chats: Chat[] = [];
    static admins: number[] = [];

    static appendUser(user: User) {
        this.users.push(user);
    }

    static appendChat(chat: Chat) {
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

    static includesUser(user: User): boolean {
        for (let i = 0; i < this.users.length; i++) {
            const storedUser = this.users[i];
            if (user.userId == storedUser.userId) return true;
        }

        return false;
    }

    static includesChat(chat: Chat): boolean {
        for (let i = 0; i < this.chats.length; i++) {
            const storedChat = this.chats[i];
            if (chat.peerId == storedChat.peerId) return true;
        }

        return false;
    }

}