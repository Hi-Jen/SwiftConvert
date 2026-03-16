const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  console.warn('[Security Warning] JWT Secrets are not defined in .env! Using fallback for development only.');
}

class AuthService {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePasswords(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
  }

  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (err) {
      return null;
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (err) {
      return null;
    }
  }
}

module.exports = AuthService;
