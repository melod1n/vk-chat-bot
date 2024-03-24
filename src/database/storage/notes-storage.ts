/* eslint-disable no-async-promise-executor */
import {KeyStorage} from "../../model/storage";
import {Note} from "../../model/note";
import {MemoryCache} from "../memory-cache";

export class NotesStorage extends KeyStorage<Note, string> {

    tableName = "notes";

    get(titles?: string[]): Promise<Note[]> {
        return new Promise((resolve, reject) => {
            this.database.serialize(async () => {
                    if (titles) {
                        const titlesForQuery = titles.map(title => `'${title}'`).join(",");

                        this.database.all<Note>(`SELECT * FROM ${this.tableName} WHERE title IN (${titlesForQuery})`, function (error, row) {
                            if (error) {
                                reject(error);
                                console.error(error);
                            } else {
                                resolve(row);
                            }
                        });
                    } else {
                        this.database.all<Note>(`SELECT * FROM ${this.tableName}`, (error, rows) => {
                            if (error) {
                                reject(error);
                                console.error(error);
                            } else {
                                resolve(rows);
                            }
                        });
                    }
                }
            );
        });
    }

    getSingle(title: string): Promise<Note | null> {
        return new Promise((resolve, reject) => {
            this.database.serialize(() => {
                this.database.get<Note>(`SELECT * FROM ${this.tableName} WHERE title = (?)`, title, function (error, row) {
                    if (error) {
                        reject(error);
                        console.error(error);
                    } else {
                        resolve(row);
                    }
                });
            });
        });
    }

    delete(titles: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.database.run("BEGIN TRANSACTION");

            const statement = this.database.prepare(`DELETE FROM ${this.tableName} WHERE title = (?)`);

            let changesCount = 0;

            titles.forEach(title => {
                statement.run([title], function (error) {
                    if (error) {
                        reject(error);
                        console.error(error);
                        return;
                    }

                    changesCount += this.changes;
                });
            });

            statement.finalize(() => {
                this.database.run("COMMIT", (error) => {
                    if (error) {
                        reject(error);
                        console.error(error);
                    } else {
                        resolve(changesCount == titles.length);
                    }
                });
            });
        });
    }

    deleteSingle(title: string): Promise<boolean> {
        return this.delete([title]);
    }

    store(values: Note[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.database.run("BEGIN TRANSACTION");

            const statement = this.database.prepare(`INSERT INTO ${this.tableName} (title, content) VALUES (?, ?)`);

            let changesCount = 0;

            values.forEach(note => {
                if (!MemoryCache.includesNote(note)) {
                    MemoryCache.appendNote(note);

                    statement.run([note.title, note.content], function (error) {
                        if (error) {
                            reject(error);
                            console.error(error);
                            return;
                        }

                        changesCount += this.changes;
                    });
                }
            });

            statement.finalize(() => {
                this.database.run("COMMIT", (error) => {
                    if (error) {
                        reject(error);
                        console.error(error);
                    } else {
                        resolve(changesCount == values.length);
                    }
                });
            });
        });
    }

    storeSingle(value: Note): Promise<boolean> {
        return this.store([value]);
    }

    clear(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.database.serialize(() => {
                this.database.run(`DELETE FROM ${this.tableName}`, function (error) {
                    if (error) {
                        reject(error);
                        console.error(error);
                    } else {
                        resolve(this.changes);
                    }
                });
            });
        });
    }
}