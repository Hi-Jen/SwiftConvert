import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, type, theme, setAuthModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const endpoint = type === 'login' ? '/login' : '/register';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '오류가 발생했습니다.');
      }

      if (type === 'login') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ text: '로그인에 성공했습니다! 잠시 후 창이 닫힙니다.', type: 'success' });
        setTimeout(() => {
          onClose();
          window.location.reload(); // Simple way to refresh state
        }, 1500);
      } else {
        setMessage({ text: '회원가입이 완료되었습니다! 이제 로그인해 주세요.', type: 'success' });
        // Optionally switch to login mode here or just keep the message
      }
    } catch (_err) {
      setMessage({ text: _err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-[#121212] border border-white/10' : 'bg-white'
              }`}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10">
              <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                  <Zap className="w-6 h-6 text-white fill-current" />
                </div>
                <h2 className="text-2xl font-black">{type === 'login' ? '환영합니다' : '시작하기'}</h2>
                <p className="text-sm opacity-50 font-medium">SwiftConvert로 더 많은 기능을 누리세요</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                      }`}
                  >
                    {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {message.text}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-40 ml-1">이메일</label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'
                    }`}>
                    <Mail className="w-4 h-4 opacity-40" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="grow bg-transparent outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-40 ml-1">비밀번호</label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'
                    }`}>
                    <Lock className="w-4 h-4 opacity-40" />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="grow bg-transparent outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 mt-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    type === 'login' ? '로그인' : '가입하기'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs font-bold opacity-30 tracking-tight">
                  {type === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'} {' '}
                  <span
                    className="text-indigo-500 cursor-pointer hover:underline"
                    // 클릭 시 type을 반대로 전환합니다.
                    onClick={() => setAuthModal({
                      isOpen: true,
                      type: type === 'login' ? 'signup' : 'login'
                    })}
                  >
                    {type === 'login' ? '회원가입' : '로그인'}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
