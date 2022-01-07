import {Storage} from '../../model/storage';
import {MemoryCache} from '../memory-cache';

export class AdminsStorage extends Storage<number> {

    tableName = 'admins';

    async checkIfStored(id: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (id <= 0) {
                reject();
                return;
            }

            try {
                const values = await this.get();
                let stored = false;

                for (const value of values) {
                    if (value == id) {
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

    async delete(ids: number[]): Promise<void> {
        if (ids.length == 0) return;
        return new Promise((resolve, reject) => {
            MemoryCache.clearAdmins();

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

    async deleteSingle(userId: number): Promise<void> {
        return this.delete([userId]);
    }

    async get(): Promise<number[]> {
        return new Promise(async (resolve, reject) => {
                const query = `select * from ${this.tableName}`;
                const values: number[] = [];

                await this.database().each(query, (error, row) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    values.push(row.id);
                }, (e) => {
                    if (!e) resolve(values);
                });
            }
        );

    }

    async getSingle(params?: any): Promise<number> {
        return Promise.resolve(0);
    }

    async store(values: number[]): Promise<void> {
        return new Promise((resolve, reject) => {
            values.forEach(value => {
                if (!MemoryCache.includesAdmin(value))
                    MemoryCache.appendAdmin(value);

                this.database().serialize(() => {
                    this.database().run(`insert into ${this.tableName} values (?)`, [value],
                        (error) => {
                            if (error) reject(error);
                            else resolve();
                        }
                    );
                });
            });
        });
    }

    async storeSingle(value: number): Promise<void> {
        return this.store([value]);
    }

    async clear(): Promise<void> {
        return new Promise((resolve) => {
            MemoryCache.clearAdmins();

            this.database().serialize(() => {
                this.database().run(`delete from ${this.tableName}`);
                resolve();
            });
        });
    }

    fill(row: any): number {
        return 0;
    }

}