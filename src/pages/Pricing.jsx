import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Globe, Cpu, Download, Sparkles } from 'lucide-react';
import ActionBtn from '../components/shared/ActionBtn';

const Pricing = ({ theme, user, onUpdateUser }) => {
  const handleUpgrade = () => {
    // In a real app, this would trigger Stripe/Payment flow
    // For this demo, we'll just toggle the user role
    if (user) {
      onUpdateUser({ role: user.role === 'PRO' ? 'FREE' : 'PRO' });
      alert(user.role === 'PRO' ? 'FREE 등급으로 변경되었습니다.' : 'PRO 등급으로 업그레이드되었습니다! 모든 기능이 해제되었습니다.');
    } else {
      alert('로그인이 필요한 기능입니다.');
    }
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
      price: '2,900',
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
    <div className="w-full max-w-6xl mx-auto pt-16 pb-24 px-4">
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
                ? 'bg-white dark:bg-indigo-950/20 border-indigo-500 shadow-2xl shadow-indigo-500/20' 
                : 'bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/10'
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black rounded-full shadow-xl uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
              <p className="text-sm opacity-50 font-medium h-10">{plan.desc}</p>
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
              onClick={handleUpgrade}
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

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { icon: Shield, title: '100% 안전', desc: '데이터는 기기 외부로 유출되지 않습니다.' },
          { icon: Globe, title: '무제한 트래픽', desc: '언제 어디서나 무거운 파일도 거뜬하게.' },
          { icon: Cpu, title: '고성능 처리', desc: 'Web Worker를 이용한 백그라운드 연산.' }
        ].map((item, i) => (
          <div key={i} className="text-center p-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
            <item.icon className="w-8 h-8 mx-auto mb-4 text-indigo-600" />
            <h4 className="font-bold text-sm mb-1">{item.title}</h4>
            <p className="text-xs font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
