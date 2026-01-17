const db = require('./db');

function saveVote(date, userId, choice) {
    return new Promise((resolve, reject) => {
        db.run(
            `
            INSERT INTO votes (date, user_id, choice)
            VALUES (?, ?, ?)
            ON CONFLICT(date, user_id)
            DO UPDATE SET choice = excluded.choice
            `,
            [date, userId, choice],
            err => (err ? reject(err) : resolve())
        );
    });
}

function getVotesByDate(date) {
    return new Promise((resolve, reject) => {
        db.all(
            `
            SELECT choice, COUNT(*) as count
            FROM votes
            WHERE date = ?
            GROUP BY choice
            `,
            [date],
            (err, rows) => (err ? reject(err) : resolve(rows))
        );
    });
}

module.exports = {
    saveVote,
    getVotesByDate
};
