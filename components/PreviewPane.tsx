
import React, { useState, useEffect } from 'react';
import { travelQuotes } from '../services/travelQuotes';

interface PreviewPaneProps {
  htmlContent: string | null;
  isLoading: boolean;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ htmlContent, isLoading }) => {
  const [currentQuote, setCurrentQuote] = useState<string>('');

  useEffect(() => {
    if (isLoading) {
      setCurrentQuote(travelQuotes[Math.floor(Math.random() * travelQuotes.length)]);
      
      const intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * travelQuotes.length);
        setCurrentQuote(travelQuotes[randomIndex]);
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">미리보기</h2>
      <div className="flex-grow bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-6"></div>
            <p className="text-slate-600 font-semibold text-lg">
              일정을 생성중입니다.
              <br />
              <span className="text-sm">이 작업은 최대 2분 이상 소요될 수 있습니다.</span>
            </p>
            <p className="mt-8 text-slate-500 italic px-4">"{currentQuote}"</p>
          </div>
        ) : htmlContent ? (
          <iframe
            srcDoc={htmlContent}
            title="일정 미리보기"
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500 p-4">
              <p className="font-semibold">생성된 여행 일정이 여기에 표시됩니다.</p>
              <p className="text-sm mt-1">일정을 추가하고 '일정 생성' 버튼을 클릭하세요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPane;