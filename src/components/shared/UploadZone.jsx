import React, { useRef } from 'react';
import { Upload, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadZone = ({ 
  onFilesSelected, 
  isDragging, 
  onDragOver, 
  onDragLeave, 
  onDrop,
  user,
  setAuthModal,
  hasFiles
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative min-h-[320px] rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 bg-indigo-50/10 dark:bg-indigo-900/5
        ${isDragging ? 'border-indigo-500 scale-[1.02]' : 'border-indigo-200 dark:border-indigo-800'}
        ${hasFiles ? 'mb-10' : ''}
      `}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-stretch">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="apple-btn-primary px-8 py-5 rounded-l-2xl flex items-center gap-3 active:scale-95 transition-all shadow-xl"
          >
            <Upload className="w-6 h-6" />
            <span className="text-xl font-bold">파일 선택</span>
          </button>
          <button className="apple-btn-primary px-4 rounded-r-2xl border-l border-white/20 active:scale-95 transition-all shadow-xl">
            <ChevronDown className="w-6 h-6" />
          </button>
          <input 
            type="file" 
            multiple 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold opacity-30 tracking-tight">
            최대 {user?.role === 'PRO' ? '100MB' : '10MB'} (Client-Only). 
            {!user ? (
              <>
                {' '}<span 
                  onClick={() => setAuthModal({ isOpen: true, type: 'signup' })}
                  className="text-indigo-500 cursor-pointer underline hover:opacity-100 transition-opacity"
                >가입하기</span>를 통해 더 많은 기능을 이용해보세요.
              </>
            ) : (
              user?.role !== 'PRO' && " PRO로 업그레이드하고 100MB까지 올리세요."
            )}
            {user?.role === 'PRO' && " PRO 등급: 100MB까지 지원됩니다."}
          </p>
          <p className="text-xs mt-1 opacity-20">계속 진행하시면 당사의 이용 약관에 동의하는 것으로 간주됩니다.</p>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
