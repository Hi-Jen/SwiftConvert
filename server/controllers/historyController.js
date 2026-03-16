const HistoryService = require('../services/historyService');

/**
 * HistoryController: Handles HTTP requests for conversion history
 */
class HistoryController {
  static async createHistory(req, res, next) {
    try {
      const { fileName, fromFormat, toFormat } = req.body;
      const historyId = await HistoryService.recordHistory(req.user.id, fileName, fromFormat, toFormat);
      
      res.status(201).json({ 
        message: '기록이 저장되었습니다.', 
        historyId 
      });
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const history = await HistoryService.getUserHistory(req.user.id);
      res.json(history);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = HistoryController;
