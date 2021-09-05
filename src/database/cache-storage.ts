import {UsersStorage} from './storage/users-storage';
import {ChatsStorage} from './storage/chats-storage';
import {AdminsStorage} from './storage/admins-storage';
import {MutedStorage} from './storage/muted-storage';

export class CacheStorage {

    static users = new UsersStorage();
    static chats = new ChatsStorage();
    static admins = new AdminsStorage();
    static muted = new MutedStorage();

}