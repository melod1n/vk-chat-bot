import { Database } from "sqlite3";

export let database: Database;

export class DatabaseManager {
    chatsTable = "chats";
    usersTable = "users";
    notesTable = "notes";
    adminsTable = "admins";
    mutedTable = "muted";

    private createChatsTable =
        `create table if not exists ${this.chatsTable} ("id" integer primary key on conflict replace, "isAllowed" integer default 1, "membersCount" integer default 0, "type" text, "title" text, "adminsIds" text, "usersIds" text);`;
    private createUsersTable =
        `create table if not exists ${this.usersTable} ("id" integer primary key on conflict replace, "firstName" varchar(255), "lastName" varchar(255), "isClosed" integer default 0, "photo200" varchar(255))`;
    private createNotesTable =
        `create table if not exists ${this.notesTable} ("id" integer primary key on conflict replace, "title" varchar(255), "content" text);`;
    private createAdminsTable =
        `create table if not exists ${this.adminsTable} ("id" integer primary key on conflict replace);`;
    private createMutedTable =
        `create table if not exists ${this.mutedTable} ("id" integer primary key on conflict replace)`;

    private constructor(newDb: Database) {
        database = newDb;
    }

    static create(newDb: Database): DatabaseManager {
        return new DatabaseManager(newDb);
    }

    async init(): Promise<void> {
        database.exec(this.createChatsTable);
        database.exec(this.createUsersTable);
        database.exec(this.createNotesTable);
        database.exec(this.createAdminsTable);
        database.exec(this.createMutedTable);

    }
}