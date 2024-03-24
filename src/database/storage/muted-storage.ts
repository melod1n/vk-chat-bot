/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any */
// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {Storage} from "../../model/storage";

export class MutedStorage extends Storage<number> {

    tableName = "muted";

    delete(params: any): Promise<boolean> {
        return Promise.resolve(undefined);
    }

    deleteSingle(params: any): Promise<boolean> {
        return Promise.resolve(undefined);
    }

    get(params: any): Promise<number[]> {
        return Promise.resolve([]);
    }

    getSingle(params: any): Promise<number> {
        return Promise.resolve(0);
    }

    store(values: number[]): Promise<boolean> {
        return Promise.resolve(undefined);
    }

    storeSingle(value: number): Promise<boolean> {
        return Promise.resolve(undefined);
    }

    clear(): Promise<number> {
        return Promise.resolve(undefined);
    }

    fill(row: any): number {
        return 0;
    }
}