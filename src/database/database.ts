import * as SQLite from 'sqlite3';

export let db = new SQLite.Database('data/database.sql');