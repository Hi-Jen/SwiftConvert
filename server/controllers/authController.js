const UserRepository = require('../repositories/userRepository');
const AuthService = require('../services/authService');

class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const error = new Error('이메일과 비밀번호를 모두 입력해 주세요.');
        error.status = 400;
        throw error;
      }

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        const error = new Error('이미 사용 중인 이메일입니다.');
        error.status = 409;
        throw error;
      }

      const passwordHash = await AuthService.hashPassword(password);
      const userId = await UserRepository.create(email, passwordHash);

      res.status(201).json({ message: '회원가입이 완료되었습니다.', userId });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const error = new Error('이메일과 비밀번호를 모두 입력해 주세요.');
        error.status = 400;
        throw error;
      }

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        const error = new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
        error.status = 401;
        throw error;
      }

      const isMatch = await AuthService.comparePasswords(password, user.password_hash);
      if (!isMatch) {
        const error = new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
        error.status = 401;
        throw error;
      }

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      await UserRepository.updateRefreshToken(user.id, refreshToken);
      await UserRepository.updateLastLogin(user.id);

      res.json({
        message: '로그인 성공',
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
