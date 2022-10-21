import {UsersStorage} from "./storage/users-storage";
import {ChatsStorage} from "./storage/chats-storage";
import {AdminsStorage} from "./storage/admins-storage";
import {NotesStorage} from "./storage/notes-storage";

export class CacheStorage {

    static users: UsersStorage;
    static chats: ChatsStorage;
    static admins: AdminsStorage;
    static notes: NotesStorage;

    static init() {
        this.users = new UsersStorage();
        this.chats = new ChatsStorage();
        this.admins = new AdminsStorage();
        this.notes = new NotesStorage();
    }
}