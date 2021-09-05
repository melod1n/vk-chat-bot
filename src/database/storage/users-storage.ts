import {VkUser} from '../../model/vk-user';
import {Storage} from '../../model/storage';
import {LoadManager} from '../../api/load-manager';
import {MemoryCache} from '../memory-cache';

export class UsersStorage extends Storage<VkUser> {

    async checkIfStored(userId: number): Promise<boolean> {
        if (isNaN(userId) || userId < 0) return;

        const users = await this.get();
        let stored = false;

        for (const user of users) {
            if (user.id == userId) {
                stored = true;
                break;
            }
        }

        if (!stored) LoadManager.users.loadSingle(userId).then();
    }

    async get(usersIds?: number[]): Promise<VkUser[]> {
        return new Promise((resolve, reject) => {
            this.database.serialize(() => {
                    const query = 'select * from users' + (usersIds ? ' where peerId = (?)' : '');

                    if (usersIds) {
                        let user: VkUser = null;

                        this.database.each(query, [usersIds], (error, row) => {
                            user = this.fill(row);
                        }, (error) => {
                            if (error) reject(error);
                            else resolve([user]);
                        });
                    } else {
                        let users: VkUser[] = [];

                        this.database.each(query, (error, row) => {
                            users.push(this.fill(row));
                        }, (error) => {
                            if (error) reject(error);
                            else resolve(users);
                        });
                    }
                }
            );
        });
    }

    async getSingle(userId: number): Promise<VkUser> {
        return new Promise((resolve, reject) => this.get([userId]).then(users => resolve(users[0])).catch(reject));
    }

    async store(values: VkUser[]): Promise<void> {
        return new Promise((resolve, reject) => {
            values.forEach(value => {
                if (!MemoryCache.includesUser(value)) {
                    MemoryCache.appendUser(value);

                    this.database.serialize(() => {
                        this.database.prepare('insert into users values (?, ?, ?, ?, ?)',
                            [value.id, value.firstName, value.lastName, value.isClosed, value.photo200],
                            (error) => {
                                if (error) reject(error);
                                else resolve();
                            });
                    });
                }
            });
        });
    }

    async storeSingle(value: VkUser): Promise<void> {
        return this.store([value]);
    }

    async delete(usersIds: number[]): Promise<void> {
        if (usersIds.length == 0) return;
        return new Promise((resolve, reject) => {

            let query = `delete from users where userId = ${usersIds[0]}`;
            for (let i = 1; i < usersIds.length; i++) {
                query += ' or ';
                query += `userId = ${usersIds[i]}`;
            }
            this.database.serialize(() => {
                this.database.run(query, [], (e) => {
                    if (e) reject(e);
                    else resolve();
                });
            });
        });
    }

    async deleteSingle(userId: number): Promise<void> {
        return this.delete([userId]);
    }

    async clear(): Promise<void> {
        return new Promise((resolve) => {
            this.database.serialize(() => {
                this.database.run('delete from users');
                resolve();
            });
        });
    }

    fill(row: any): VkUser {
        const user = new VkUser();

        user.id = row.userId;
        user.firstName = row.firstName;
        user.lastName = row.lastName;
        user.isClosed = row.isClosed;

        return user;
    }


}