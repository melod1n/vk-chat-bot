import {VkUser} from "../model/vk-user";
import {VkChat} from "../model/vk-chat";
import {CacheStorage} from "./cache-storage";
import {Note} from "../model/note";

export class MemoryCache {

    private static users: VkUser[] = [];
    private static chats: VkChat[] = [];
    private static admins: number[] = [];
    private static notes: Note[] = [];

    static appendUser(user: VkUser) {
        this.users.push(user);
    }

    static appendChat(chat: VkChat) {
        this.chats.push(chat);
    }

    static appendAdmin(adminId: number) {
        this.admins.push(adminId);
    }

    static appendNote(note: Note) {
        this.notes.push(note);
    }

    static searchUserIndex(userId: number): number | null {
        for (let i = 0; i < this.usersSize(); i++) {
            const storedUser = this.getUserByIndex(i);
            if (storedUser.id == userId) return i;
        }

        return null;
    }

    static searchChatIndex(peerId: number): number | null {
        for (let i = 0; i < this.chatsSize(); i++) {
            const storedChat = this.getChatByIndex(i);
            if (storedChat.id == peerId) return i;
        }

        return null;
    }

    static searchAdminIndex(adminId: number): number | null {
        for (let i = 0; i < this.adminsSize(); i++) {
            const storedAdmin = this.getAdminByIndex(i);
            if (storedAdmin == adminId) return i;
        }

        return null;
    }

    static searchNoteIndex(noteId: number): number | null {
        for (let i = 0; i < this.notesSize(); i++) {
            const storedNote = this.getNoteByIndex(i);
            if (storedNote.id == noteId) return i;
        }

        return null;
    }

    static clearUsers() {
        this.users = [];
    }

    static clearChats() {
        this.chats = [];
    }

    static clearAdmins() {
        this.admins = [];
    }

    static clear() {
        this.clearUsers();
        this.clearChats();
        this.clearAdmins();
    }

    static includesAdmin(adminId: number): boolean {
        for (const storedAdmin of this.admins) {
            if (storedAdmin == adminId) return true;
        }

        return false;
    }

    static includesChat(chat: VkChat): boolean {
        for (const storedChat of this.chats) {
            if (chat.id == storedChat.id) return true;
        }

        return false;
    }

    static includesUser(user: VkUser): boolean {
        for (const storedUser of this.users) {
            if (user.id == storedUser.id) return true;
        }

        return false;
    }

    static includesNote(note: Note): boolean {
        for (const storedNote of this.notes) {
            if (storedNote.id == note.id) return true;
        }

        return false;
    }

    static adminsSize(): number {
        return this.admins.length;
    }

    static chatsSize(): number {
        return this.chats.length;
    }

    static usersSize(): number {
        return this.users.length;
    }

    static notesSize(): number {
        return this.notes.length;
    }

    static isAdminsEmpty(): boolean {
        return this.adminsSize() == 0;
    }


    static isChatsEmpty(): boolean {
        return this.chatsSize() == 0;
    }

    static isUsersEmpty(): boolean {
        return this.usersSize() == 0;
    }

    static isNotesEmpty(): boolean {
        return this.notes.length == 0;
    }

    static getAdminByIndex(index: number): number | null {
        return this.admins[index];
    }

    static getChatByIndex(index: number): VkChat | null {
        return this.chats[index];
    }


    static getUserByIndex(index: number): VkUser | null {
        return this.users[index];
    }

    static getNoteByIndex(index: number): Note | null {
        return this.notes[index];
    }

    static getUser(userId: number): Promise<VkUser | null> {
        return new Promise((resolve, reject) => {
            let found = false;
            for (const storedUser of this.users) {
                if (!storedUser) continue;

                if (storedUser.id == userId) {
                    found = true;
                    resolve(storedUser);
                    break;
                }
            }

            if (!found) {
                CacheStorage.users.getSingle(userId).then(user => {
                    resolve(user);
                    this.appendUser(user);
                }).catch(reject);
            }
        });

    }

    static getChat(peerId: number): Promise<VkChat | null> {
        return new Promise((resolve, reject) => {
            let found = false;
            for (const storedChat of this.chats) {
                if (storedChat.id == peerId) {
                    found = true;
                    resolve(storedChat);
                    break;
                }
            }

            if (!found) {
                CacheStorage.chats.getSingle(peerId).then(chat => {
                    resolve(chat);
                    this.appendChat(chat);
                }).catch(reject);
            }
        });
    }

    static getNote(noteId: number): Promise<Note | null> {
        return new Promise((resolve, reject) => {
            let found = false;
            for (const storedNote of this.notes) {
                if (storedNote.id == noteId) {
                    found = true;
                    resolve(storedNote);
                }
            }

            if (!found) {
                CacheStorage.notes.getSingle(noteId).then(note => {
                    resolve(note);
                    this.appendNote(note);
                }).catch(reject);
            }
        });
    }

}