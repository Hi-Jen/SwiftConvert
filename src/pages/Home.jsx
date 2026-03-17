import React from 'react';
import { motion } from 'framer-motion';
import { Files, Globe, ShieldCheck } from 'lucide-react';
import ActionBtn from '../components/shared/ActionBtn';

const Home = ({ theme, renderMainSection }) => {
  return (
    <main className="grow flex flex-col items-center pt-16 md:pt-24 px-4 pb-20">
      <header className="text-center max-w-2xl mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
        >
          SwiftConvert
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl font-medium opacity-60 leading-relaxed"
        >
          클라이언트 사이드에서 안전하고 빠르게 파일을 변환하세요.<br />
          모든 작업은 브라우저 내에서 직접 수행됩니다.
        </motion.p>
      </header>

      {renderMainSection()}

      <section className="w-full max-w-6xl mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 border-t border-gray-100 dark:border-white/5 pt-20">
        <div className="flex flex-col items-center text-center px-4">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 animate-float ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
            <Files className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold mb-4">모든 파일 변환</h3>
          <p className="text-sm opacity-50 leading-relaxed font-medium">
            주요 이미지 포맷과 PDF 변환을 지원합니다. <br />
            브라우저 내에서 직접 변환 결과물을 <br />
            미세 조정할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col items-center text-center px-4">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 animate-float ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}`} style={{ animationDelay: '0.2s' }}>
            <Globe className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold mb-4">어디서나 작동</h3>
          <p className="text-sm opacity-50 leading-relaxed font-medium">
            100% 온라인 클라이언트 사이드 변환기입니다. <br />
            모든 최신 브라우저에서 완벽하게 작동합니다.
          </p>
        </div>

        <div className="flex flex-col items-center text-center px-4">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 animate-float ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}`} style={{ animationDelay: '0.4s' }}>
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold mb-4">개인정보 보호 보장</h3>
          <p className="text-sm opacity-50 leading-relaxed font-medium">
            당신의 데이터는 당신의 기기 내에서만 처리됩니다. <br />
            어떤 데이터도 서버에 업로드되지 않아 <br />
            100% 안전합니다.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Home;
