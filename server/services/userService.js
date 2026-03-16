const UserRepository = require('../repositories/userRepository');
const AuthService = require('./authService');

/**
 * UserService: Business logic for user account management
 */
class UserService {
  static async updateProfile(userId, email) {
    if (!userId || !email) {
      const error = new Error('필수 정보가 누락되었습니다.');
      error.status = 400;
      throw error;
    }

    // 이메일 정규식 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('올바른 이메일 형식이 아닙니다.');
      error.status = 400;
      throw error;
    }
    
    // Check if email is already taken by another user
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      const error = new Error('이미 사용 중인 이메일입니다.');
      error.status = 409;
      throw error;
    }

    return await UserRepository.updateEmail(userId, email);
  }

  static async changePassword(userId, newPassword) {
    if (!userId || !newPassword) {
      const error = new Error('새 비밀번호를 입력해 주세요.');
      error.status = 400;
      throw error;
    }

    // 비밀번호 길이 검사 (최소 8자)
    if (newPassword.length < 8) {
      const error = new Error('비밀번호는 최소 8자 이상이어야 합니다.');
      error.status = 400;
      throw error;
    }

    const passwordHash = await AuthService.hashPassword(newPassword);
    return await UserRepository.updatePassword(userId, passwordHash);
  }

  static async deleteAccount(userId) {
    if (!userId) {
      const error = new Error('사용자 인증이 필요합니다.');
      error.status = 401;
      throw error;
    }
    return await UserRepository.delete(userId);
  }
}

module.exports = UserService;
