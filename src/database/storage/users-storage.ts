import {VkUser} from "../../model/vk-user";
import {Storage} from "../../model/storage";
import {MemoryCache} from "../memory-cache";

export class UsersStorage extends Storage<VkUser> {

    tableName = "users";

    async get(ids?: number[]): Promise<VkUser[]> {
        return new Promise((resolve, reject) => {
                const query = `select * from ${this.tableName}` + (ids ? " where id = (?)" : "");

                if (ids) {
                    let value: VkUser = null;

                    this.database.each(query, [ids], (error, row) => {
                        if (error) {
                            return reject(error);
                        }
                        value = this.fill(row);
                    });

                    resolve([value]);
                } else {
                    const values: VkUser[] = [];

                    this.database.each(query, (error, row) => {
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

    async getSingle(id: number): Promise<VkUser | null> {
        return new Promise((resolve, reject) => this.get([id]).then(values => resolve(values[0])).catch(reject));
    }

    async store(values: VkUser[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            values.forEach(value => {
                MemoryCache.appendUser(value);
                this.database.run(`insert into ${this.tableName} values (?, ?, ?, ?, ?)`,
                    [value.id, value.firstName, value.lastName, value.isClosed, value.photo200],
                    (error) => {
                        if (error) reject(error);
                        else resolve(true);
                    });
            });
        });
    }

    async storeSingle(value: VkUser): Promise<boolean> {
        return this.store([value]);
    }

    async delete(ids: number[]): Promise<boolean> {
        if (ids.length == 0) return;
        return new Promise((resolve, reject) => {

            let query = `delete from ${this.tableName} where id = ${ids[0]}`;
            for (let i = 1; i < ids.length; i++) {
                query += " or ";
                query += `id = ${ids[i]}`;
            }
            this.database.serialize(() => {
                this.database.run(query, [], (e) => {
                    if (e) reject(e);
                    else resolve(true);
                });
            });
        });
    }

    async deleteSingle(id: number): Promise<boolean> {
        return this.delete([id]);
    }

    async clear(): Promise<number> {
        return new Promise((resolve) => {
            this.database.serialize(() => {
                this.database.run(`delete from ${this.tableName}`);
                resolve(0);
            });
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fill(row: any): VkUser {
        const user = new VkUser();

        user.id = row.id;
        user.firstName = row.firstName;
        user.lastName = row.lastName;
        user.isClosed = row.isClosed;

        return user;
    }
}