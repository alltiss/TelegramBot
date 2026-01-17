const db = require('./db');

function saveMaterials(date, text) {
    db.run(
        `INSERT INTO days (date, materials)
         VALUES (?, ?)
         ON CONFLICT(date)
         DO UPDATE SET materials = excluded.materials`,
        [date, text]
    );
}

function savePhoto(date, fileId, type, mediaType) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO photos (date, file_id, type, media_type)
             VALUES (?, ?, ?, ?)`,
            [date, fileId, type, mediaType],
            err => (err ? reject(err) : resolve())
        );
    });
}

function getDay(date, cb) {
    db.get(
        `SELECT materials FROM days WHERE date = ?`,
        [date],
        cb
    );
}


module.exports = {
    savePhoto,
    saveMaterials,
    getDay
};
