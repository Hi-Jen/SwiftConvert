const db = require('../db/database');

class UserRepository {
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(email, passwordHash) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (email, password_hash) VALUES (?, ?)';
      db.run(sql, [email, passwordHash], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  static updateRefreshToken(userId, refreshToken) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET refresh_token = ? WHERE id = ?';
      db.run(sql, [refreshToken, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
      db.run(sql, [userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static updateEmail(userId, email) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET email = ? WHERE id = ?';
      db.run(sql, [email, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static updatePassword(userId, passwordHash) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
      db.run(sql, [passwordHash, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static delete(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM users WHERE id = ?';
      db.run(sql, [userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = UserRepository;
