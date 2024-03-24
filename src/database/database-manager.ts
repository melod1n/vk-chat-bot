import {Database} from "sqlite3";

export let database: Database;

export class DatabaseManager {
    chatsTable = "chats";
    usersTable = "users";
    notesTable = "notes";
    adminsTable = "admins";
    mutedTable = "muted";

    private createChatsTable =
        `CREATE TABLE IF NOT EXISTS ${this.chatsTable} ("id" INTEGER PRIMARY KEY ON CONFLICT REPLACE, "isAllowed" INTEGER DEFAULT 1, "membersCount" INTEGER DEFAULT 0, "type" TEXT, "title" TEXT, "adminsIds" TEXT, "usersIds" TEXT);`;
    private createUsersTable =
        `CREATE TABLE IF NOT EXISTS ${this.usersTable} ("id" INTEGER PRIMARY KEY ON CONFLICT REPLACE, "firstName" VARCHAR(255), "lastName" VARCHAR(255), "isClosed" INTEGER DEFAULT 0, "photo200" VARCHAR(255))`;
    private createNotesTable =
        `CREATE TABLE IF NOT EXISTS ${this.notesTable} ("title" VARCHAR(255) PRIMARY KEY UNIQUE, "content" TEXT);`;
    private createAdminsTable =
        `CREATE TABLE IF NOT EXISTS ${this.adminsTable} ("id" INTEGER PRIMARY KEY ON CONFLICT REPLACE);`;
    private createMutedTable =
        `CREATE TABLE IF NOT EXISTS ${this.mutedTable} ("id" INTEGER PRIMARY KEY ON CONFLICT REPLACE)`;

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