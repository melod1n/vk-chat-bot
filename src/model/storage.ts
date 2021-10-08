import {Database} from 'sqlite3';
import {database} from '../database/database-manager';

export abstract class Storage<T> {

    protected abstract tableName: string;

    abstract get(params?: any): Promise<T[]>;

    abstract getSingle(params?: any): Promise<T>;

    abstract store(values: T[]): Promise<void>;

    abstract storeSingle(value: T): Promise<void>;

    abstract delete(params?: any): Promise<void>;

    abstract deleteSingle(params?: any): Promise<void>;

    abstract clear(): Promise<void>;

    abstract fill(row: any): T;

    protected database(): Database {
        return database;
    }

}