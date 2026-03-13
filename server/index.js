const express = require('express');
const cors = require('cors');
require('dotenv').config();

const AuthController = require('./controllers/authController');
const authenticateToken = require('./middleware/authMiddleware');
const HistoryRepository = require('./repositories/historyRepository');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);

// History Routes
app.post('/api/history', authenticateToken, async (req, res) => {
  try {
    const { fileName, fromFormat, toFormat } = req.body;
    const historyId = await HistoryRepository.create(req.user.id, fileName, fromFormat, toFormat);
    res.status(201).json({ message: '기록이 저장되었습니다.', historyId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const history = await HistoryRepository.findByUserId(req.user.id);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Protected Route Example
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
