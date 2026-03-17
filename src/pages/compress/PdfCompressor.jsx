import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize, Download, Loader2, Gauge, CheckCircle2, AlertCircle, FileText, Lock } from 'lucide-react';
import UploadZone from '../../components/shared/UploadZone';
import ActionBtn from '../../components/shared/ActionBtn';
import { compressPdf, downloadBlob } from '../../utils/converter';
import confetti from 'canvas-confetti';
import PaywallOverlay from '../../components/shared/PaywallOverlay';

const PdfCompressor = ({ 
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
  const [compressing, setCompressing] = useState(false);
  const [quality, setQuality] = useState(0.5);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const selectedPdf = useMemo(() => 
    files.find(f => f.status !== 'error' && f.name.toLowerCase().endsWith('.pdf')),
    [files]
  );

  const handleCompress = async () => {
    if (!selectedPdf) return;
    
    setCompressing(true);
    setError(null);
    setResult(null);

    try {
      // Use Web Worker for PDF Compression
      const worker = new Worker(new URL('../../utils/conversionWorker.js', import.meta.url), { type: 'module' });
      
      worker.onmessage = (e) => {
        const { status, blob, message } = e.data;
        if (status === 'success') {
          const originalSize = selectedPdf.file.size;
          const newSize = blob.size;
          const savings = Math.max(0, ((originalSize - newSize) / originalSize) * 100).toFixed(1);

          setResult({
            blob,
            url: URL.createObjectURL(blob),
            originalSize: (originalSize / (1024 * 1024)).toFixed(2),
            newSize: (newSize / (1024 * 1024)).toFixed(2),
            savings,
            name: `compressed_${selectedPdf.name}`
          });

          setCompressing(false);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          worker.terminate();
        } else {
          setError(`압축 중 오류 발생: ${message}`);
          setCompressing(false);
          worker.terminate();
        }
      };

      worker.onerror = (err) => {
        console.error('Worker error:', err);
        setError('워커 실행 중 오류가 발생했습니다.');
        setCompressing(false);
        worker.terminate();
      };

      worker.postMessage({
        type: 'COMPRESS_PDF',
        file: selectedPdf.file,
        quality: quality,
        id: selectedPdf.id
      });

    } catch (err) {
      console.error('PDF Compression failed:', err);
      setError('PDF 압축 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
      setCompressing(false);
    }
  };

  const levels = [
    { id: 'low', label: '최소 압축', value: 0.8, desc: '고화질 유지' },
    { id: 'med', label: '권장 압축', value: 0.5, desc: '품질과 용량의 균형' },
    { id: 'high', label: '최대 압축', value: 0.2, desc: '최소 용량' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto pt-12 pb-20 px-4 relative">
      <AnimatePresence>
        {user?.role !== 'PRO' && (
          <PaywallOverlay 
            title="PDF 압축은 PRO 전용입니다" 
            description="고성능 알고리즘을 사용한 PDF 용량 최적화 기능은 PRO 요금제에서 제공됩니다. 지금 업그레이드하세요." 
          />
        )}
      </AnimatePresence>
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black mb-2 tracking-tight">PDF 용량 압축</h1>
        <p className="opacity-60 text-sm font-medium leading-relaxed">
          대용량 PDF 파일을 화질 저하를 최소화하면서 가볍게 최적화하세요. <br/>
          <span className="text-indigo-500 font-bold">Client-Only:</span> 모든 처리는 브라우저 내에서 안전하게 이루어집니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <UploadZone 
            onFilesSelected={handleFiles}
            isDragging={isDragging}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            user={user}
            setAuthModal={setAuthModal}
            hasFiles={files.length > 0}
            accept=".pdf"
          />

          {selectedPdf && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-[32px] border border-indigo-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-red-500" />
                </div>
                <div className="grow min-w-0">
                  <h3 className="font-bold text-sm truncate">{selectedPdf.name}</h3>
                  <p className="text-xs opacity-40 font-bold uppercase">{selectedPdf.size} MB • 원본 파일</p>
                </div>
                <button 
                  onClick={() => removeFile(selectedPdf.id)}
                  className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <AlertCircle className="w-5 h-5 opacity-20" />
                </button>
              </div>
            </motion.div>
          )}

          {!selectedPdf && files.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              PDF 파일만 압축이 가능합니다. PDF 파일을 올려주세요.
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="glass-card rounded-[32px] p-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <Minimize className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black mb-1">압축 옵션 설정</h2>
              <p className="text-sm opacity-50 mb-8 font-medium">원하는 용량과 화질의 균형을 선택하세요.</p>

              <div className="space-y-3 mb-8">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setQuality(level.value)}
                    className={`w-full p-4 rounded-2xl text-left border-2 transition-all group ${
                      quality === level.value 
                        ? 'border-indigo-600 bg-indigo-600/5 ring-4 ring-indigo-600/10' 
                        : 'border-transparent bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm">{level.label}</span>
                      {quality === level.value && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] font-medium opacity-50 group-hover:opacity-100 transition-opacity">
                      {level.desc}
                    </p>
                  </button>
                ))}
              </div>

              <ActionBtn 
                onClick={handleCompress}
                variant="primary"
                className="w-full py-5 shadow-xl shadow-indigo-500/25 relative overflow-hidden"
                disabled={compressing || !selectedPdf}
                loading={compressing}
                icon={Minimize}
              >
                {quality === 0.2 && user?.role !== 'PRO' && <Lock className="w-3.5 h-3.5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />}
                PDF 압축 시작하기
              </ActionBtn>
              
              {error && (
                <p className="mt-4 text-[11px] font-bold text-red-500 text-center">{error}</p>
              )}
            </div>

            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="glass-card rounded-[32px] p-8 border border-green-500/30 bg-green-500/5 relative overflow-hidden shadow-2xl shadow-green-500/10"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                      <Gauge className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">최적화 완료!</h3>
                      <p className="text-xs opacity-60">
                        용량이 <span className="text-green-600 font-black">{result.savings}%</span> 줄어들었습니다.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                      <p className="text-[10px] font-black opacity-30 uppercase mb-1">원본 용량</p>
                      <p className="font-bold text-sm">{result.originalSize} MB</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/10">
                      <p className="text-[10px] font-black text-green-600 uppercase mb-1">압축 결과</p>
                      <p className="font-bold text-sm text-green-600">{result.newSize} MB</p>
                    </div>
                  </div>

                  <ActionBtn 
                    onClick={() => downloadBlob(result.blob, result.name)}
                    variant="primary"
                    className="w-full py-4 bg-green-600 hover:bg-green-500 shadow-xl shadow-green-500/20"
                    icon={Download}
                  >
                    압축 파일 다운로드
                  </ActionBtn>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfCompressor;
