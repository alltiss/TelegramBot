const db = require('./db');

function savePhoto(date, fileId, type, mediaType) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO photos (date, file_id, type, media_type)
       VALUES (?, ?, ?, ?)`,
            [date, fileId, type, mediaType],
            (err) => (err ? reject(err) : resolve())
        );
    });
}

function getPhotosByDate(date) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT id, file_id, type, media_type FROM photos WHERE date = ?`,
            [date],
            (err, rows) => (err ? reject(err) : resolve(rows))
        );
    });
}

function saveMaterials(date, text) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO days (date, materials)
       VALUES (?, ?)
       ON CONFLICT(date)
       DO UPDATE SET materials = excluded.materials`,
            [date, text],
            (err) => (err ? reject(err) : resolve())
        );
    });
}

function getMaterialsByDate(date) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT materials FROM days WHERE date = ?`,
            [date],
            (err, row) => (err ? reject(err) : resolve(row?.materials))
        );
    });
}

function deletePhotoById(id) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM photos WHERE id = ?`,
            [id],
            (err) => (err ? reject(err) : resolve())
        );
    });
}

function deleteMaterialsByDate(date) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE days SET materials = NULL WHERE date = ?`,
            [date],
            (err) => (err ? reject(err) : resolve())
        );
    });
}


function deletePhotosByDateAndType(date, type) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM photos WHERE date = ? AND type = ?`,
            [date, type],
            err => (err ? reject(err) : resolve())
        );
    });
}


module.exports = {
    savePhoto,
    getPhotosByDate,
    saveMaterials,
    getMaterialsByDate,
    deleteMaterialsByDate,
    deletePhotoById,
    deletePhotosByDateAndType,
};


