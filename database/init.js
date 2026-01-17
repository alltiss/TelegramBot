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
            date TEXT NOT NULL,
            file_id TEXT NOT NULL,
            type TEXT NOT NULL,        -- angles / stage
            media_type TEXT NOT NULL   -- photo / document
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS votes (
            date TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            choice TEXT NOT NULL,      -- yes / no / late
            PRIMARY KEY (date, user_id)
        )
    `);

    console.log('✅ Таблицы БД проверены / созданы');
});
