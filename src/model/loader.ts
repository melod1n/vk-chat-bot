export abstract class Loader<T> {

    abstract load(params?: unknown): Promise<T[]>;

    abstract loadSingle(params?: unknown): Promise<T>;

}