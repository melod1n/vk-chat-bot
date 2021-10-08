import {Storage} from '../../model/storage';

export class MutedStorage extends Storage<number> {

    tableName = 'muted';

    checkIfStored(params: any): Promise<boolean> {
        return Promise.resolve(false);
    }

    delete(params: any): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteSingle(params: any): Promise<void> {
        return Promise.resolve(undefined);
    }

    get(params: any): Promise<number[]> {
        return Promise.resolve([]);
    }

    getSingle(params: any): Promise<number> {
        return Promise.resolve(0);
    }

    store(values: number[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    storeSingle(value: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    clear(): Promise<void> {
        return Promise.resolve(undefined);
    }

    fill(row: any): number {
        return 0;
    }

}