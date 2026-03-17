import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Download, Type, Layout, Sliders, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import UploadZone from '../../components/shared/UploadZone';
import ActionBtn from '../../components/shared/ActionBtn';
import { addWatermark, downloadBlob } from '../../utils/converter';
import jsZip from 'jszip';
import confetti from 'canvas-confetti';

const Watermarker = ({ 
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
  const [processing, setProcessing] = useState(false);
  const [options, setOptions] = useState({
    text: 'SwiftConvert',
    fontSize: 48,
    opacity: 0.5,
    position: 'center',
    color: '#ffffff'
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const previewCanvasRef = useRef(null);

  const selectedFile = files[0]; // For preview, we use the first file

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const updatePreview = async () => {
      try {
        const blob = await addWatermark(selectedFile.file, options);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error('Preview update failed', err);
      }
    };

    const timer = setTimeout(updatePreview, 100);
    return () => clearTimeout(timer);
  }, [selectedFile, options]);

  const handleApply = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    const zip = new jsZip();
    
    try {
      for (const fileObj of files) {
        if (fileObj.status === 'error') continue;
        const watermarkedBlob = await addWatermark(fileObj.file, options);
        zip.file(`watermarked_${fileObj.name}`, watermarkedBlob);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, 'swiftconvert_watermarked.zip');
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Watermarking failed', err);
    } finally {
      setProcessing(processing => false);
    }
  };

  const positions = [
    { id: 'top-left', label: '좌상단' },
    { id: 'top-right', label: '우상단' },
    { id: 'center', label: '가운데' },
    { id: 'bottom-left', label: '좌하단' },
    { id: 'bottom-right', label: '우하단' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto pt-12 pb-20 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          워터마크 삽입하기
        </h1>
        <p className="opacity-60 text-sm font-medium">이미지에 텍스트 워터마크를 추가하여 저작권을 보호하세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-indigo-500">
        <div className="lg:col-span-8 flex flex-col gap-6 ">
          <UploadZone 
            onFilesSelected={handleFiles}
            isDragging={isDragging}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            user={user}
            setAuthModal={setAuthModal}
            hasFiles={files.length > 0}
          />

          {selectedFile && (
            <div className="glass-card rounded-[32px] p-6 overflow-hidden border border-indigo-500/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">실시간 미리보기</h3>
                <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Preview Mode</span>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} className="max-w-full max-h-full object-contain" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-bold">생성 중...</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/5">
                    <img src={selectedFile.preview} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-[10px] opacity-40 uppercase font-black">{selectedFile.size} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => removeFile(selectedFile.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[32px] p-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Sliders className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black tracking-tight">워터마크 설정</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest pl-1">텍스트 내용</label>
                <input 
                  type="text" 
                  value={options.text}
                  onChange={(e) => setOptions({...options, text: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-sm"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest">투명도</label>
                  <span className="text-[10px] font-black text-indigo-600">{Math.round(options.opacity * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" max="1" step="0.05"
                  value={options.opacity}
                  onChange={(e) => setOptions({...options, opacity: parseFloat(e.target.value)})}
                  className="w-full h-1.5 accent-indigo-600 bg-black/5 dark:bg-white/5 rounded-full" 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest">글자 크기 (PX)</label>
                  <span className="text-[10px] font-black text-indigo-600">{options.fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" max="200" step="2"
                  value={options.fontSize}
                  onChange={(e) => setOptions({...options, fontSize: parseInt(e.target.value)})}
                  className="w-full h-1.5 accent-indigo-600 bg-black/5 dark:bg-white/5 rounded-full" 
                />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black opacity-40 uppercase tracking-widest pl-1">위치 선정</label>
                 <div className="grid grid-cols-3 gap-2">
                    {positions.map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => setOptions({...options, position: pos.id})}
                        className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all ${
                          options.position === pos.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                 </div>
              </div>

              <ActionBtn 
                onClick={handleApply} 
                variant="primary"
                className="w-full py-5 mt-6 shadow-xl shadow-indigo-500/20"
                disabled={processing || files.length === 0}
                loading={processing}
                icon={Wrench}
              >
                {files.length > 1 ? `전체 ${files.length}개 적용 및 다운로드` : '워터마크 적용 및 다운로드'}
              </ActionBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watermarker;
