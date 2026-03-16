import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, CheckCircle, AlertTriangle, Key, Trash2, X, Loader2 } from 'lucide-react';

const AccountView = ({ user, onLogout, onUpdateUser }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalType, setModalType] = useState(null); // 'password' | 'delete' | null
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        if (onUpdateUser) onUpdateUser({ email }); // Sync state with parent
      } else {
        setStatusMessage({ type: 'error', text: data.message });
      }
    } catch {
      setStatusMessage({ type: 'error', text: '서버와의 통신에 실패했습니다.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return;
    setIsUpdating(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiUrl}/api/user/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setNewPassword('');
        setModalType(null);
      } else {
        setStatusMessage({ type: 'error', text: data.message });
      }
    } catch {
      setStatusMessage({ type: 'error', text: '비밀번호 변경 중 오류가 발생했습니다.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiUrl}/api/user/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('계정이 삭제되었습니다. 이용해 주셔서 감사합니다.');
        onLogout();
      } else {
        const data = await response.json();
        setStatusMessage({ type: 'error', text: data.message });
      }
    } catch {
      setStatusMessage({ type: 'error', text: '계정 삭제 중 오류가 발생했습니다.' });
    } finally {
      setIsUpdating(false);
      setModalType(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-indigo-500" />
        <h2 className="text-2xl font-black">내 계정 설정</h2>
      </div>

      <AnimatePresence>
        {statusMessage.text && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-2xl flex items-center gap-3 ${
              statusMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            } font-bold text-sm`}
          >
            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {statusMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card rounded-[32px] p-8 space-y-6">
        <div className="flex items-center gap-6 pb-8 border-b border-black/5 dark:border-white/5">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-600/30">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-black opacity-30 uppercase tracking-widest mb-1">Premium Member</p>
            <h3 className="text-xl font-bold">{user?.email}</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-40 ml-1">이메일 주소</label>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-indigo-500/30 transition-all">
              <Mail className="w-5 h-5 opacity-30" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent grow outline-none font-bold text-sm"
                placeholder="이메일을 입력해 주세요"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleUpdateProfile}
              disabled={isUpdating || email === user?.email}
              className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              정보 업데이트
            </button>
            <button 
              onClick={() => setModalType('password')}
              className="py-4 bg-black/5 dark:bg-white/5 font-black rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 opacity-40" />
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[32px] p-8 border-red-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-500">
            <Shield className="w-5 h-5" />
            <span className="font-bold">위험 구역</span>
          </div>
          <button 
            onClick={() => setModalType('delete')}
            className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-black hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            계정 삭제
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              {modalType === 'password' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Key className="w-6 h-6" />
                    </div>
                    <button onClick={() => setModalType(null)} className="p-2 opacity-20 hover:opacity-100 transition-opacity">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-2">비밀번호 변경</h3>
                    <p className="text-sm opacity-40 font-medium">새로운 비밀번호를 입력해 주세요.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-indigo-500/30 transition-all">
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="새 비밀번호"
                        className="bg-transparent w-full outline-none font-bold text-sm"
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={handleChangePassword}
                      disabled={!newPassword || isUpdating}
                      className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : '변경하기'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <button onClick={() => setModalType(null)} className="p-2 opacity-20 hover:opacity-100 transition-opacity">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-2">계정 삭제 확인</h3>
                    <p className="text-sm text-red-500 font-bold">주의: 이 작업은 되돌릴 수 없습니다.</p>
                    <p className="text-sm opacity-40 font-medium mt-2 leading-relaxed">계정을 삭제하면 모든 변환 기록과 설정이 영구적으로 사라집니다. 정말 진행하시겠습니까?</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isUpdating}
                      className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : '네, 삭제하겠습니다'}
                    </button>
                    <button 
                      onClick={() => setModalType(null)}
                      className="w-full py-4 bg-black/5 dark:bg-white/5 font-black rounded-2xl transition-all active:scale-95"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccountView;
