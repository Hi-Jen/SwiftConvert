const db = require('../db/database');

class HistoryRepository {
  static create(userId, fileName, fromFormat, toFormat) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO conversion_history (user_id, file_name, from_format, to_format) VALUES (?, ?, ?, ?)';
      db.run(sql, [userId, fileName, fromFormat, toFormat], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM conversion_history WHERE user_id = ? ORDER BY timestamp DESC';
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = HistoryRepository;
