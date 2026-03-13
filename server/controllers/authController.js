const UserRepository = require('../repositories/userRepository');
const AuthService = require('../services/authService');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해 주세요.' });
      }

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
      }

      const passwordHash = await AuthService.hashPassword(password);
      const userId = await UserRepository.create(email, passwordHash);

      res.status(201).json({ message: '회원가입이 완료되었습니다.', userId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해 주세요.' });
      }

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      }

      const isMatch = await AuthService.comparePasswords(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
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
      console.error(err);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
}

module.exports = AuthController;
