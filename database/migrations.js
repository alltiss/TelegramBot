const db = require('./db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS days (
            date TEXT PRIMARY KEY,
            materials TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            file_id TEXT,
            type TEXT
        )
    `);
});
