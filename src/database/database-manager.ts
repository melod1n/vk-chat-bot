import * as SQLite from 'sqlite3';

export const AppDatabase = new SQLite.Database('data/database.sql');