const HistoryRepository = require('../repositories/historyRepository');

/**
 * HistoryService: Business logic for conversion history
 */
class HistoryService {
  static async recordHistory(userId, fileName, fromFormat, toFormat) {
    if (!userId || !fileName || !fromFormat || !toFormat) {
      const error = new Error('필수 정보가 누락되었습니다.');
      error.status = 400;
      throw error;
    }
    return await HistoryRepository.create(userId, fileName, fromFormat, toFormat);
  }

  static async getUserHistory(userId) {
    if (!userId) {
      const error = new Error('사용자 인증이 필요합니다.');
      error.status = 401;
      throw error;
    }
    return await HistoryRepository.findByUserId(userId);
  }
}

module.exports = HistoryService;
