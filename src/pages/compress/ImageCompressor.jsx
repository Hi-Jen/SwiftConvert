import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize, Download, Loader2, Info, ArrowLeftRight } from 'lucide-react';
import UploadZone from '../../components/shared/UploadZone';
import FilePreviewList from '../../components/shared/FilePreviewList';
import ActionBtn from '../../components/shared/ActionBtn';
import { compressImage, downloadBlob } from '../../utils/converter';

const ImageCompressor = ({ 
  files, 
  theme, 
  user, 
  setAuthModal, 
  handleFiles, 
  isDragging, 
  onDragOver, 
  onDragLeave, 
  onDrop,
  removeFile,
  setFiles,
  handleClearAll
}) => {
  const [quality, setQuality] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedResult, setCompressedResult] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const activeFile = files.find(f => f.status !== 'error');

  const runCompression = useCallback(async () => {
    if (!activeFile) return;
    
    setIsProcessing(true);
    try {
      const { blob, preview } = await compressImage(activeFile.file, quality, activeFile.file.type.split('/')[1]);
      setCompressedResult({
        blob,
        preview,
        size: (blob.size / 1024 / 1024).toFixed(2),
        originalSize: activeFile.size,
        savings: (((activeFile.file.size - blob.size) / activeFile.file.size) * 100).toFixed(1)
      });
    } catch (err) {
      console.error('Compression Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [activeFile, quality]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runCompression();
    }, 300);
    return () => clearTimeout(timer);
  }, [runCompression]);

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(x, 0), 100));
  };

  const handleDownload = () => {
    if (compressedResult && activeFile) {
      downloadBlob(compressedResult.blob, `compressed_${activeFile.name}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-12 pb-20 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black mb-2">이미지 압축</h1>
        <p className="opacity-60 text-sm">최첨단 알고리즘으로 품질 저하 없이 용량을 최적화하세요.</p>
      </header>

      {!activeFile ? (
        <UploadZone 
          onFilesSelected={handleFiles}
          isDragging={isDragging}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          user={user}
          setAuthModal={setAuthModal}
          hasFiles={false}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Before/After Viewer */}
            <div 
              className="relative aspect-video rounded-3xl overflow-hidden glass-card border border-indigo-500/20 shadow-2xl cursor-col-resize select-none"
              onMouseDown={() => setIsResizing(true)}
              onMouseUp={() => setIsResizing(false)}
              onMouseLeave={() => setIsResizing(false)}
              onMouseMove={handleMouseMove}
            >
              {/* After (Compressed) */}
              <div className="absolute inset-0">
                <img 
                  src={compressedResult?.preview || activeFile.preview} 
                  className="w-full h-full object-contain" 
                  alt="After" 
                />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                  After ({compressedResult?.size || '?'} MB)
                </div>
              </div>

              {/* Before (Original) */}
              <div 
                className="absolute inset-0 overflow-hidden border-r-2 border-white/50 shadow-[10px_0_30px_rgba(0,0,0,0.3)]"
                style={{ width: `${sliderPos}%` }}
              >
                <div className="absolute inset-0 w-[calc(100%*(100/var(--slider-pos)))]" style={{ width: `calc(10000% / ${sliderPos})` }}>
                   <img 
                    src={activeFile.preview} 
                    className="absolute inset-0 w-full h-full object-contain" 
                    style={{ width: `${100 / (sliderPos / 100)}%` }}
                    alt="Before" 
                  />
                </div>
                <div className="absolute bottom-4 left-4 bg-indigo-600/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                  Before ({activeFile.size} MB)
                </div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize flex items-center justify-center z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center -ml-0.5">
                  <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                </div>
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-20">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
               <ActionBtn 
                onClick={handleClearAll}
                variant="danger"
                className="px-6 py-4"
              >
                다른 파일 선택
              </ActionBtn>
              <div className="grow bg-indigo-500/5 rounded-2xl p-4 flex items-center gap-3 border border-indigo-500/10">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p className="text-xs font-medium opacity-60">슬라이더를 좌우로 움직여 압축 전후의 화질 차이를 실시간으로 비교해보세요.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-indigo-500/20">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Minimize className="w-5 h-5 text-indigo-500" />
                압축 매개변수
              </h3>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black opacity-40 uppercase tracking-widest">품질 (Quality)</label>
                    <span className="text-2xl font-black text-indigo-600">{(quality * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.01"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold opacity-30">
                    <span>최저 용량</span>
                    <span>최고 화질</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold opacity-50">예상 절감률</span>
                    <span className="text-sm font-black text-green-500">
                      {compressedResult ? `-${compressedResult.savings}%` : '계산 중...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold opacity-50">최종 파일 크기</span>
                    <span className="text-sm font-black">
                      {compressedResult ? `${compressedResult.size} MB` : '...'}
                    </span>
                  </div>
                </div>

                <ActionBtn 
                  onClick={handleDownload} 
                  variant="primary"
                  className="w-full py-5 shadow-2xl shadow-indigo-500/40"
                  disabled={!compressedResult || isProcessing}
                  icon={Download}
                >
                  압축 파일 다운로드
                </ActionBtn>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
              <h4 className="font-bold text-sm mb-2 italic">Pro Tip</h4>
              <p className="text-xs opacity-80 leading-relaxed">
                웹용 이미지는 70-80% 품질이 가장 효율적입니다. 눈으로 확인하기 어려운 미세한 차이로 용량을 대폭 줄일 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCompressor;
