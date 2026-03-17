import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Shield, Globe, Cpu, Download, Sparkles, Copy, X, CreditCard } from 'lucide-react';
import ActionBtn from '../components/shared/ActionBtn';

const Pricing = ({ theme, user, onUpdateUser }) => {
  const [showPayment, setShowPayment] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleUpgradeClick = () => {
    if (user) {
      setShowPayment(true);
    } else {
      alert('로그인이 필요한 기능입니다.');
    }
  };

  const copyAccount = () => {
    navigator.clipboard.writeText('100004590889');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualConfirm = () => {
    // In a real app, this sends a notification to the admin
    alert('입금 확인 요청이 전송되었습니다. 관리자 확인 후 등급이 조정됩니다.');
    setShowPayment(false);
    
    // For demo purposes, we can still toggle it or leave it as is
    // onUpdateUser({ role: 'PRO' }); 
  };

  const plans = [
    {
      name: 'Free',
      price: '0',
      desc: '기본적인 변환 기능이 필요한 개인 사용자',
      features: [
        '파일당 최대 10MB 제한',
        '모든 기본 이미지 변환',
        '기본 PDF 병합',
        '개별 파일 다운로드',
        '광고 포함 (준비 중)'
      ],
      current: user?.role !== 'PRO',
      btnText: '현재 플랜'
    },
    {
      name: 'Pro',
      price: '1,500',
      desc: '생산성을 극대화하고 싶은 파워 유저',
      features: [
        '파일당 최대 100MB 확장',
        '모든 프리미엄 도구 (Word 변환 등)',
        '고성능 PDF 압축 (Web Worker)',
        '여러 파일 ZIP 일괄 다운로드',
        '광고 제거 및 우선 처리',
        '다크 모드 전체 지원'
      ],
      current: user?.role === 'PRO',
      btnText: '업그레이드 하기',
      featured: true
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto pt-16 pb-24 px-4 text-black dark:text-white">
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-black uppercase tracking-widest mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          Pricing Plans
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">당신에게 맞는 플랜을 선택하세요</h1>
        <p className="opacity-50 text-lg font-medium max-w-2xl mx-auto">
          커피 한 잔 가격으로 모든 제약을 해제하고 SwiftConvert의 강력한 도구들을 무제한으로 이용하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-10 rounded-[40px] border transition-all duration-500 ${
              plan.featured 
                ? 'bg-white dark:bg-indigo-900/40 border-indigo-500 shadow-2xl shadow-indigo-500/20' 
                : 'bg-white/80 dark:bg-white/10 border-black/5 dark:border-white/10 backdrop-blur-md'
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black rounded-full shadow-xl uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black mb-2 text-indigo-600 dark:text-indigo-400">{plan.name}</h3>
              <p className="text-sm opacity-60 font-medium h-10">{plan.desc}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black">₩{plan.price}</span>
              <span className="opacity-30 font-bold">/월</span>
            </div>

            <div className="space-y-4 mb-10">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.featured ? 'bg-indigo-500/20' : 'bg-black/5 dark:bg-white/5'}`}>
                    <Check className={`w-3 h-3 ${plan.featured ? 'text-indigo-600' : 'opacity-40'}`} />
                  </div>
                  <span className="text-sm font-medium opacity-80">{feature}</span>
                </div>
              ))}
            </div>

            <ActionBtn
              onClick={handleUpgradeClick}
              variant={plan.featured ? 'primary' : 'secondary'}
              className="w-full py-5 rounded-2xl font-black text-sm"
              disabled={plan.current}
            >
              <Zap className={`w-4 h-4 fill-current ${plan.featured ? 'text-white' : ''}`} />
              {plan.current ? '현재 사용 중' : plan.btnText}
            </ActionBtn>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-indigo-500/20 shadow-2xl overflow-hidden text-black dark:text-white"
            >
               <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
               <button 
                 onClick={() => setShowPayment(false)}
                 className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
               >
                 <X className="w-5 h-5 opacity-40" />
               </button>

               <div className="flex flex-col items-center text-center">
                 <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                   <CreditCard className="w-8 h-8 text-indigo-600" />
                 </div>
                 <h2 className="text-2xl font-black mb-2">PRO 업그레이드 결제</h2>
                 <p className="text-sm opacity-50 font-medium mb-8">아래 계좌로 입금 후 확인 버튼을 눌러주세요.</p>

                 <div className="w-full space-y-4 mb-8">
                   <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                     <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1 text-left">입금 계좌 (Toss Bank)</p>
                     <div className="flex items-center justify-between">
                       <span className="text-lg font-black tracking-tight">1000-0459-0889</span>
                       <button 
                         onClick={copyAccount}
                         className={`p-2 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20'}`}
                       >
                         {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       </button>
                     </div>
                   </div>

                   <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                     <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1 text-left">입금 금액</p>
                     <div className="flex items-baseline gap-1">
                       <span className="text-2xl font-black text-indigo-600">1,500</span>
                       <span className="text-sm font-bold opacity-40">원</span>
                     </div>
                   </div>
                 </div>

                 <ActionBtn
                   onClick={handleManualConfirm}
                   variant="primary"
                   className="w-full py-5 rounded-2xl font-black text-sm"
                 >
                   입금 완료 및 확인 요청
                 </ActionBtn>
                 <p className="mt-4 text-[10px] font-medium opacity-30 text-black dark:text-white">
                   입금 확인 후 24시간 이내에 등급이 상향 조정됩니다.
                 </p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pricing;
