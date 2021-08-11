import {db} from './database';
import {User} from '../model/user';
import {Chat} from '../model/chat';

export class CacheStorage {

    static async getAdmins(): Promise<number[]> {
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

    static async getMuted(): Promise<number[]> {
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

    static async getUsers(): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {
            let users: User[] = [];

            db.serialize(() => db.each('select * from users', (err, row) => {
                users.push(this.fillUser(row));
            }, (error) => {
                if (error) reject(error);
                else resolve(users);
            }));
        });
    }

    static async getChats(): Promise<Chat[]> {
        return new Promise<Chat[]>((resolve, reject) => {
            let chats: Chat[] = [];

            db.serialize(() => {
                db.each('select * from chats', (error, row) => {
                    chats.push(this.fillChat(row));
                }, (error) => {
                    if (error) reject(error);
                    else resolve(chats);
                });
            });
        });
    }

    static async storeUser(user: User): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run('insert into users values (?, ?, ?, ?, ?)',
                    [user.userId, user.firstName, user.lastName, user.isClosed, user.photo200],
                    (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
            });
        });
    }

    static async storeChat(chat: Chat): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run('insert into chats values (?, ?, ?, ?, ?, ?, ?, ?)',
                    [chat.peerId, chat.type, chat.localId, chat.title, chat.isAllowed, chat.membersCount, chat.getAdminIds(), chat.getUsers()],
                    (error) => {
                        if (error) reject(error);
                        else resolve();
                    }
                );
            });
        });
    }

    static async storeUsers(users: User[]): Promise<any> {
        return new Promise((resolve, reject) => {
            users.forEach((user) => {
                this.storeUser(user).catch(reject).then(resolve);
            });
        });
    }

    static async storeChats(chats: Chat[]): Promise<any> {
        return new Promise((resolve, reject) => {
            chats.forEach((chat) => {
                this.storeChat(chat).catch(reject).then(resolve);
            });
        });
    }

    static async getUser(userId: number): Promise<User> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.each('select * from users where userId = (?)', [userId], (error, row) => {
                    if (error) reject(error);
                    else resolve(this.fillUser(row));
                }, (error) => {
                    if (error) reject(error);
                    else resolve(null);
                });
            });
        });
    }

    static async getChat(peerId: number): Promise<Chat> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.each('select * from chats where peerId = (?)', [peerId], (error, row) => {
                    if (error) reject(error);
                    else resolve(this.fillChat(row));
                }, (error) => {
                    if (error) reject(error);
                    else resolve(null);
                });
            });
        });
    }

    static fillUser(row): User {
        const user = new User();

        user.userId = row.userId;
        user.firstName = row.firstName;
        user.lastName = row.lastName;
        user.isClosed = row.isClosed;

        return user;
    }

    static fillChat(row): Chat {
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
}

globalThis.cacheStorage = CacheStorage;
