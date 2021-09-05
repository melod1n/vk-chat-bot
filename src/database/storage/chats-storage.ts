import {Storage} from '../../model/storage';
import {VkChat} from '../../model/vk-chat';
import {injectable} from 'inversify';
import {MemoryCache} from '../memory-cache';

@injectable()
export class ChatsStorage extends Storage<VkChat> {

    async checkIfStored(peerId: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const chats = await this.get();
                let stored = false;

                for (const chat of chats) {
                    if (chat.peerId == peerId) {
                        stored = true;
                        break;
                    }
                }

                resolve(stored);
            } catch (e) {
                reject(e);
            }
        });

    }

    async get(peersIds?: number[]): Promise<VkChat[]> {
        return new Promise((resolve, reject) => {
            this.database.serialize(() => {
                    const query = 'select * from chats' + (peersIds ? ' where peerId = (?)' : '');

                    if (peersIds) {
                        let chat: VkChat = null;

                        this.database.each(query, [peersIds], (error, row) => {
                            chat = this.fill(row);
                        }, (error) => {
                            if (error) reject(error);
                            else resolve([chat]);
                        });
                    } else {
                        let chats: VkChat[] = [];

                        this.database.each(query, (error, row) => {
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

    async getSingle(peerId: number): Promise<VkChat> {
        return new Promise((resolve, reject) => this.get([peerId]).then(chats => resolve(chats[0])).catch(reject));
    }

    async store(values: VkChat[]): Promise<void> {
        return new Promise((resolve, reject) => {
            values.forEach(value => {
                if (!MemoryCache.includesChat(value)) {
                    MemoryCache.appendChat(value);
                    this.database.serialize(() => {
                        this.database.prepare('insert into chats values (?, ?, ?, ?, ?, ?, ?, ?)',
                            [value.peerId, value.type, value.localId, value.title, value.isAllowed,
                                value.membersCount, value.getAdminIds(), value.getUsers()],
                            (error) => {
                                if (error) reject(error);
                                else resolve();
                            }
                        );
                    });
                }
            });
        });
    }

    async storeSingle(value: VkChat): Promise<void> {
        return this.store([value]);
    }

    async delete(peersIds: number[]): Promise<void> {
        if (peersIds.length == 0) return;
        return new Promise((resolve, reject) => {

            let query = `delete from chats where peerId = ${peersIds[0]}`;
            for (let i = 1; i < peersIds.length; i++) {
                query += ' or ';
                query += `peerId = ${peersIds[i]}`;
            }
            this.database.serialize(() => {
                this.database.run(query, [], (e) => {
                    if (e) reject(e);
                    else resolve();
                });
            });
        });
    }

    async deleteSingle(chatId: number): Promise<void> {
        return this.delete([chatId]);
    }

    async clear(): Promise<void> {
        return new Promise((resolve) => {
            this.database.serialize(() => {
                this.database.run('delete from chats');
                resolve();
            });
        });
    }

    fill(row: any): VkChat {
        const chat = new VkChat();

        chat.peerId = row.peerId;
        chat.localId = row.localId;
        chat.isAllowed = row.isAllowed;
        chat.membersCount = row.membersCount;
        chat.type = row.type;
        chat.title = row.title;

        if (row.users) {
            const splitUsers: string[] = row.users.split(',');
            splitUsers.forEach(userId => {
                chat.usersIds.push(parseInt(userId));
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