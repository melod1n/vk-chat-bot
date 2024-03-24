import {Storage} from "../../model/storage";
import {MemoryCache} from "../memory-cache";

type Admin = {
    id: number;
}

export class AdminsStorage extends Storage<number> {

    tableName = "admins";

    async delete(ids: number[]): Promise<boolean> {
        if (ids.length == 0) return;
        return new Promise((resolve, reject) => {
            MemoryCache.clearAdmins();

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

    async deleteSingle(userId: number): Promise<boolean> {
        return this.delete([userId]);
    }

    async get(): Promise<number[]> {
        return new Promise((resolve, reject) => {
                const query = `select * from ${this.tableName}`;
                const values: number[] = [];

                this.database.each<Admin>(query, (error, row) => {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getSingle(params?: unknown): Promise<number> {
        return Promise.resolve(0);
    }

    async store(values: number[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            values.forEach(value => {
                if (!MemoryCache.includesAdmin(value))
                    MemoryCache.appendAdmin(value);

                this.database.serialize(() => {
                    this.database.run(`insert into ${this.tableName} values (?)`, [value],
                        (error) => {
                            if (error) reject(error);
                            else resolve(true);
                        }
                    );
                });
            });
        });
    }

    async storeSingle(value: number): Promise<boolean> {
        return this.store([value]);
    }

    async clear(): Promise<number> {
        return new Promise((resolve) => {
            MemoryCache.clearAdmins();

            this.database.serialize(() => {
                this.database.run(`delete from ${this.tableName}`);
                resolve(0);
            });
        });
    }
}