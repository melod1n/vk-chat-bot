import * as SQLite from 'sqlite3';
import {User} from '../model/user';
import {Chat} from '../model/chat';
import {CacheStorage} from './cache-storage';

class DatabaseData {
    admins: number[];
    muted: number[];
    users: User[];
    chats: Chat[];
}

export let db = new SQLite.Database('data/database.sql');
export let database: DatabaseData;

export class Database {

    static async getStoredData(): Promise<DatabaseData> {
        return new Promise(async (resolve, reject) => {
            try {
                let data = new DatabaseData();

                data.chats = await CacheStorage.getChats();
                data.users = await CacheStorage.getUsers();
                data.admins = await CacheStorage.getAdmins();
                data.muted = await CacheStorage.getMuted();

                resolve(data);
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
}

globalThis.db = Database;

Database.getStoredData().catch(console.error).then(r => {
    database = <DatabaseData>r;

    globalThis.dbData = database;
});