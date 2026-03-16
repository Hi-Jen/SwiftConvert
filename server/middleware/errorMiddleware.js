/**
 * Centralized Error Handling Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error] ${err.stack || err.message}`);

  const status = err.status || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다.';

  res.status(status).json({
    status: 'error',
    statusCode: status,
    message: message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorMiddleware;
