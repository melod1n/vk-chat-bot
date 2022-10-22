import {Database} from "sqlite3";

export let database: Database;

export class DatabaseManager {
    chatsTable = "chats";
    usersTable = "users";
    notesTable = "notes";
    adminsTable = "admins";
    mutedTable = "muted";

    private createChatsTable =
        `create table ${this.chatsTable} ("id" integer primary key on conflict replace, "isAllowed" integer default 1, "membersCount" integer default 0, "type" text, "title" text, "adminsIds" text, "usersIds" text);`;
    private createUsersTable =
        `create table ${this.usersTable} ("id" integer primary key on conflict replace, "firstName" varchar(255), "lastName" varchar(255), "isClosed" integer default 0, "photo200" varchar(255))`;
    private createNotesTable =
        `create table ${this.notesTable} ("id" integer primary key on conflict replace, "title" varchar(255), "content" text);`;
    private createAdminsTable =
        `create table ${this.adminsTable} ("id" integer primary key on conflict replace);`;
    private createMutedTable =
        `create table ${this.mutedTable} ("id" integer primary key on conflict replace)`;

    private constructor(newDb: Database) {
        database = newDb;
    }

    static create(newDb: Database): DatabaseManager {
        return new DatabaseManager(newDb);
    }

    async init(): Promise<void> {
        const chatsExists = await this.checkIsTableExists(this.chatsTable);
        const usersExists = await this.checkIsTableExists(this.usersTable);
        const notesExists = await this.checkIsTableExists(this.notesTable);
        const adminsExists = await this.checkIsTableExists(this.adminsTable);
        const mutedExists = await this.checkIsTableExists(this.mutedTable);

        if (!chatsExists) await database.exec(this.createChatsTable);
        if (!usersExists) await database.exec(this.createUsersTable);
        if (!notesExists) await database.exec(this.createNotesTable);
        if (!adminsExists) await database.exec(this.createAdminsTable);
        if (!mutedExists) await database.exec(this.createMutedTable);

    }

    private checkIsTableExists(tableName: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            await database.each(`select name from sqlite_master where type='table' and name='${tableName}'`, (e, row) => {
                if (e) reject(e);
                else if (row.name == tableName) resolve(true); else resolve(false);
            });
        });
    }
}