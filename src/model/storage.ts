import {AppDatabase} from '../database/database-manager';
import {Database} from 'sqlite3';

export abstract class Storage<T> {

    protected database: Database;

    constructor() {
        this.database = AppDatabase;
    }

    abstract checkIfStored(params?: any): Promise<boolean>;

    abstract get(params?: any): Promise<T[]>;

    abstract getSingle(params?: any): Promise<T>;

    abstract store(values: T[]): Promise<void>;

    abstract storeSingle(value: T): Promise<void>;

    abstract delete(params?: any): Promise<void>;

    abstract deleteSingle(params?: any): Promise<void>;

    abstract clear(): Promise<void>;

    abstract fill(row: any): T;

}