import {db} from './database';
import {User} from '../model/user';
import {Chat} from '../model/chat';
import {MemoryCache} from './memory-cache';
import {TAG, TAG_ERROR} from '../index';
import {LoadManager} from '../api/load-manager';


class ChatsManager {

    async checkIfStored(peerId: number) {
        const chats = await CacheStorage.chats.get();
        let stored = false;

        for (const chat of chats) {
            if (chat.peerId == peerId) {
                stored = true;
                break;
            }
        }

        if (!stored) LoadManager.chats.loadSingle(peerId).then();
    }

    async get(peerId?: number): Promise<Chat[]> {
        return new Promise<Chat[]>((resolve, reject) => {
            db.serialize(() => {
                    const query = 'select * from chats' + (peerId ? ' where peerId = (?)' : '');

                    if (peerId) {
                        let chat: Chat = null;

                        db.each(query, [peerId], (error, row) => {
                            chat = this.fill(row);
                        }, (error) => {
                            if (error) reject(error);
                            else resolve([chat]);
                        });
                    } else {
                        let chats: Chat[] = [];

                        db.each(query, (error, row) => {
                            chats.push(this.fill(row));
                        }, (error) => {
                            if (error) reject(error);
                            else resolve(chats);
                        });
                    }
                }
            );
        });
    }

    async getSingle(peerId: number): Promise<Chat> {
        return new Promise((resolve, reject) => this.get(peerId).then(chats => resolve(chats[0])).catch(reject));
    }

    async store(chats: Chat[]): Promise<void> {
        return new Promise((resolve, reject) => {
            chats.forEach(chat => {
                if (!MemoryCache.includesChat(chat)) {
                    this.storeSingle(chat).catch(reject).then(resolve);
                    MemoryCache.appendChat(chat);
                }
            });
        });
    }

    private async storeSingle(chat: Chat): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.prepare('insert into chats values (?, ?, ?, ?, ?, ?, ?, ?)',
                    [chat.peerId, chat.type, chat.localId, chat.title, chat.isAllowed,
                        chat.membersCount, chat.getAdminIds(), chat.getUsers()],
                    (error) => {
                        if (error) reject(error);
                        else resolve();
                    }
                );
            });
        });
    }

    fill(row): Chat {
        const chat = new Chat();

        chat.peerId = row.peerId;
        chat.localId = row.localId;
        chat.isAllowed = row.isAllowed;
        chat.membersCount = row.membersCount;
        chat.type = row.type;
        chat.title = row.title;

        if (row.users) {
            const splitUsers: string[] = row.users.split(',');
            splitUsers.forEach(userId => {
                chat.users.push(parseInt(userId));
            });
        }

        if (row.admins) {
            const splitAdmins: string[] = row.admins.split(',');
            splitAdmins.forEach(adminId => {
                chat.admins.push(parseInt(adminId));
            });
        }

        return chat;
    }

    async clear(): Promise<void> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('delete from chats');
                resolve();
            });
        });
    }

}

class UsersManager {

    async checkIfStored(userId: number) {
        if (isNaN(userId) || userId < 0) return;

        const users = await CacheStorage.users.get();
        let stored = false;

        for (const user of users) {
            if (user.userId == userId) {
                stored = true;
                break;
            }
        }

        if (!stored) LoadManager.users.loadSingle(userId).then();
    }

    async get(userId?: number): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {
            const query = 'select * from users' + (userId ? ' where userId = (?)' : '');

            if (userId) {
                let user: User = null;

                db.each(query, [userId], (error, row) => {
                    user = this.fill(row);
                }, (error) => {
                    if (error) reject(error);
                    else resolve([user]);
                });
            } else {
                let users: User[] = [];

                db.each(query, (error, row) => {
                    users.push(this.fill(row));
                }, (error) => {
                    if (error) reject(error);
                    else resolve(users);
                });
            }
        });
    }

    async getSingle(userId: number): Promise<User> {
        return new Promise((resolve, reject) => this.get(userId).then(users => resolve(users[0])).catch(reject));
    }

    async store(users: User[]): Promise<void> {
        return new Promise((resolve, reject) => {
            users.forEach(user => {
                if (!MemoryCache.includesUser(user)) {
                    this.storeSingle(user).catch(reject).then(resolve);
                    MemoryCache.appendUser(user);
                }
            });
        });
    }

    private async storeSingle(user: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.prepare('insert into users values (?, ?, ?, ?, ?)',
                    [user.userId, user.firstName, user.lastName, user.isClosed, user.photo200],
                    (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
            });
        });
    }

    fill(row): User {
        const user = new User();

        user.userId = row.userId;
        user.firstName = row.firstName;
        user.lastName = row.lastName;
        user.isClosed = row.isClosed;

        return user;
    }

    async clear(): Promise<void> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('delete from users');
                resolve();
            });
        });
    }


}

class AdminsManager {

    async get(): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            let admins: number[] = [];

            db.serialize(() => db.each('select * from admins', (err, row) => {
                admins.push(row.userId);
            }, (error) => {
                if (error) reject(error);
                else resolve(admins);
            }));
        });
    }

    async store(adminsIds: number[]): Promise<void> {
        return new Promise((resolve, reject) => {
            adminsIds.forEach(id => {
                if (!MemoryCache.admins.includes(id)) {
                    this.storeSingle(id).catch(reject).then(resolve);
                    MemoryCache.appendAdmin(id);
                }
            });
        });
    }

    private async storeSingle(adminId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.prepare('insert into admins values (?)', [adminId],
                    (error) => {
                        if (error) reject(error);
                        else resolve();
                    }
                );
            });
        });
    }

    async clear(): Promise<void> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('delete from admins');
                resolve();
            });
        });
    }

}

class MutedManager {
    async get(): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            let muted: number[] = [];

            db.serialize(() => db.each('select * from muted', (err, row) => {
                muted.push(row.userId);
            }, (error) => {
                if (error) reject(error);
                else resolve(muted);
            }));
        });
    }
}

//todo: if some value exists in db, just update it
export class CacheStorage {

    static chats = new ChatsManager();
    static users = new UsersManager();
    static admins = new AdminsManager();
    static muted = new MutedManager();

}
