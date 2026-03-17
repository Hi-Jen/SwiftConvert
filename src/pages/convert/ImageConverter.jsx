import React from 'react';
import UploadZone from '../../components/shared/UploadZone';
import FilePreviewList from '../../components/shared/FilePreviewList';
import ActionBtn from '../../components/shared/ActionBtn';
import { Zap, Download, Loader2 } from 'lucide-react';

const ImageConverter = ({ 
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
  handleClearAll,
  startConversion,
  downloadAll,
  converting
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto pt-12 pb-20 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black mb-2">이미지 변환기</h1>
        <p className="opacity-60 text-sm">PNG, JPG, WebP 등 다양한 포맷으로 상호 변환하세요.</p>
      </header>

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

      <FilePreviewList 
        files={files}
        theme={theme}
        removeFile={removeFile}
        setFiles={setFiles}
        onClearAll={handleClearAll}
      />

      {files.length > 0 && (
        <div className="mt-8 flex gap-4">
          <ActionBtn 
            onClick={startConversion}
            variant="primary"
            className="grow py-5"
            disabled={converting || files.every(f => f.status === 'completed')}
            icon={converting ? Loader2 : Zap}
            loading={converting}
          >
            변환 시작
          </ActionBtn>
          <ActionBtn 
            onClick={downloadAll}
            variant={theme === 'dark' ? 'secondary' : 'primary'}
            className={`grow py-5 ${theme !== 'dark' ? 'bg-[#0066CC] hover:bg-[#0055BB]' : ''}`}
            disabled={!files.some(f => f.status === 'completed')}
            icon={Download}
          >
            전체 다운로드
          </ActionBtn>
        </div>
      )}
    </div>
  );
};

export default ImageConverter;
