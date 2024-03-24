// noinspection JSUnusedGlobalSymbols

import {database} from "../database/database-manager";
import {Database} from "sqlite3";

export abstract class Storage<Item> {

    database: Database = database;

    protected abstract tableName: string;

    abstract get(params?: unknown): Promise<Item[]>;

    abstract getSingle(params?: unknown): Promise<Item | null>;

    abstract store(values: Item[]): Promise<boolean>;

    abstract storeSingle(value: Item): Promise<boolean>;

    abstract delete(params?: unknown): Promise<boolean>;

    abstract deleteSingle(params?: unknown): Promise<boolean>;

    abstract clear(): Promise<number>;
}

export abstract class KeyStorage<Item, Identificator> extends Storage<Item> {

}