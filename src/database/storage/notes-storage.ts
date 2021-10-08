import {Storage} from '../../model/storage';
import {Note} from '../../model/note';
import {MemoryCache} from '../memory-cache';

export class NotesStorage extends Storage<Note> {

    tableName = 'notes';

    checkIfStored(id: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (isFinite(id) || id <= 0) {
                reject();
                return;
            }

            try {
                const values = await this.get();
                let stored = false;

                for (const value of values) {
                    if (value.id == id) {
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

    delete(ids: number[]): Promise<void> {
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

    deleteSingle(id: number): Promise<void> {
        return this.delete([id]);
    }

    get(ids?: number[]): Promise<Note[]> {
        return new Promise((resolve, reject) => {
            this.database().serialize(() => {
                    const query = `select * from ${this.tableName}` + (ids ? ' where id = (?)' : '');

                    if (ids) {
                        let value: Note = null;

                        this.database().each(query, [ids], (error, row) => {
                            value = this.fill(row);
                        }, (error) => {
                            if (error) reject(error);
                            else resolve([value]);
                        });
                    } else {
                        let values: Note[] = [];

                        this.database().each(query, (error, row) => {
                            values.push(this.fill(row));
                        }, (error) => {
                            if (error) reject(error);
                            else resolve(values);
                        });
                    }
                }
            );
        });
    }

    getSingle(id: number): Promise<Note> {
        return new Promise((resolve, reject) => {
            this.get([id]).then(values => resolve(values[0])).catch(reject);
        });
    }

    store(values: Note[]): Promise<void> {
        return new Promise((resolve, reject) => {
            values.forEach(value => {
                if (!MemoryCache.includesNote(value)) {
                    MemoryCache.appendNote(value);

                    this.database().serialize(() => {
                        this.database().run(`insert into ${this.tableName} (title, content) values(?, ?)`,
                            [value.title, value.content],
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

    storeSingle(value: Note): Promise<void> {
        return this.store([value]);
    }

    clear(): Promise<void> {
        return new Promise((resolve) => {
            this.database().serialize(() => {
                this.database().run(`delete from ${this.tableName}`);
                resolve();
            });
        });
    }

    fill(row: any): Note {
        const note = new Note();

        note.id = row.id;
        note.title = row.title;
        note.content = row.content;

        return note;
    }

}