// noinspection JSUnusedGlobalSymbols

import {database} from "../database/database-manager";
import {Database} from "sqlite3";

export abstract class Storage<T> {

    database: Database = database;

    protected abstract tableName: string;

    abstract get(params?: unknown): Promise<T[]>;

    abstract getSingle(params?: unknown): Promise<T>;

    abstract store(values: T[]): Promise<void>;

    abstract storeSingle(value: T): Promise<void>;

    abstract delete(params?: unknown): Promise<void>;

    abstract deleteSingle(params?: unknown): Promise<void>;

    abstract clear(): Promise<void>;

    abstract fill(row: unknown): T;

}