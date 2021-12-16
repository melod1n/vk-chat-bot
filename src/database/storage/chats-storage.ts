import {Storage} from '../../model/storage';
import {VkChat} from '../../model/vk-chat';

export class ChatsStorage extends Storage<VkChat> {

    tableName = 'chats';

    async get(ids?: number[]): Promise<VkChat[]> {
        return new Promise(async (resolve, reject) => {
                const query = `select * from ${this.tableName}` + (ids ? ' where id = (?)' : '');

                if (ids) {
                    let value: VkChat = null;

                    await this.database().each(query, [ids], (error, row) => {
                        console.log('chat: ' + row);
                        if (error) {
                            reject(error);
                            return;
                        }

                        value = this.fill(row);
                    });

                    resolve([value]);
                } else {
                    let values: VkChat[] = [];

                    await this.database().each(query, (error, row) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        values.push(this.fill(row));
                    });

                    resolve(values);
                }
            }
        );

    }

    async getSingle(id: number): Promise<VkChat | null> {
        return new Promise((resolve, reject) => this.get([id]).then(values => resolve(values[0])).catch(reject));
    }

    async store(values: VkChat[]): Promise<void> {
        return new Promise((resolve, reject) => {
            values.forEach(value => {
                this.database().serialize(() => {
                    this.database().run(`insert into ${this.tableName} values (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [value.id, value.type, value.localId, value.title, value.isAllowed,
                            value.membersCount, value.getAdminIds(), value.getUsers()],
                        (error) => {
                            if (error) reject(error);
                            else resolve();
                        }
                    );
                });
            });
        });
    }

    async storeSingle(value: VkChat): Promise<void> {
        return this.store([value]);
    }

    async delete(ids: number[]): Promise<void> {
        if (ids.length == 0) return;
        return new Promise((resolve, reject) => {

            let query = `delete from ${this.tableName} where id = ${ids[0]}`;
            for (let i = 1; i < ids.length; i++) {
                query += ' or ';
                query += `id = ${ids[i]}`;
            }
            this.database().serialize(() => {
                this.database().run(query, [], (e) => {
                    if (e) reject(e);
                    else resolve();
                });
            });
        });
    }

    async deleteSingle(id: number): Promise<void> {
        return this.delete([id]);
    }

    async clear(): Promise<void> {
        return new Promise((resolve) => {
            this.database().serialize(() => {
                this.database().run(`delete from ${this.tableName}`);
                resolve();
            });
        });
    }

    fill(row: any): VkChat {
        const chat = new VkChat();

        chat.id = row.id;
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