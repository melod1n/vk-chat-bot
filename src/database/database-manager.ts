import {Database} from 'sqlite';

export let database;

export function setDatabase(newDb: Database) {
    database = newDb;
}

export class DatabaseManager {
    chatsTable = 'chats';
    usersTable = 'users';
    notesTable = 'notes';
    adminsTable = 'admins';
    mutedTable = 'muted';

    database: Database;

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

    constructor(database: Database) {
        this.database = database;
    }

    async init(): Promise<void> {
        const chatsExists = await this.checkIsTableExists(this.chatsTable);
        const usersExists = await this.checkIsTableExists(this.usersTable);
        const notesExists = await this.checkIsTableExists(this.notesTable);
        const adminsExists = await this.checkIsTableExists(this.adminsTable);
        const mutedExists = await this.checkIsTableExists(this.mutedTable);


        if (!chatsExists) await this.database.exec(this.createChatsTable);
        if (!usersExists) await this.database.exec(this.createUsersTable);
        if (!notesExists) await this.database.exec(this.createNotesTable);
        if (!adminsExists) await this.database.exec(this.createAdminsTable);
        if (!mutedExists) await this.database.exec(this.createMutedTable);

    }

    private checkIsTableExists(tableName: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this.database.each(`select name from sqlite_master where type='table' and name='${tableName}'`, (e, row) => {
                if (e) reject(e);
                else if (row.name == tableName) resolve(true); else resolve(false);
            });
        });
    }


}