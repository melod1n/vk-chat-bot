export abstract class Loader<T> {

    abstract load(params?: any): Promise<T[]>;

    abstract loadSingle(params?: any): Promise<T>;

}