const AuthService = require('../services/authService');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 없습니다.' });
  }

  const user = AuthService.verifyAccessToken(token);
  if (!user) {
    return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
  }

  req.user = user;
  next();
};

module.exports = authenticateToken;
