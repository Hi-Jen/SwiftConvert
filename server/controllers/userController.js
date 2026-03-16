const UserService = require('../services/userService');

/**
 * UserController: Handles HTTP requests for user account management
 */
class UserController {
  static async updateProfile(req, res, next) {
    try {
      const { email } = req.body;
      await UserService.updateProfile(req.user.id, email);
      
      res.json({ 
        message: '프로필 정보가 업데이트되었습니다.',
        user: { id: req.user.id, email }
      });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { newPassword } = req.body;
      await UserService.changePassword(req.user.id, newPassword);
      
      res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      await UserService.deleteAccount(req.user.id);
      res.json({ message: '계정이 안전하게 삭제되었습니다.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
