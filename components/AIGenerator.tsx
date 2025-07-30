
import React, { useState } from 'react';
import { generateFullItineraryFromPrompt } from '../services/geminiService';
import type { ScheduleItem, UIChecklistItem } from '../types';
import { SparklesIcon } from './Icons';
import CoupangCarouselAd from './CoupangCarouselAd';
import { useResponsiveLayout } from '../services/deviceDetection';

interface AIGeneratorProps {
  onGenerate: (schedule: ScheduleItem[], checklist: UIChecklistItem[]) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onGenerate }) => {
  const [destination, setDestination] = useState('');
  const [concept, setConcept] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numPeople, setNumPeople] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 디바이스 정보와 레이아웃 설정 가져오기
  const { deviceInfo, layoutConfig, isMobile, isTablet, isDesktop } = useResponsiveLayout();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!destination || !startDate || !endDate) {
      setError("여행지, 시작일, 종료일은 필수 항목입니다.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        setError("종료일은 시작일보다 빠를 수 없습니다.");
        return;
    }
    setIsLoading(true);
    try {
      const result = await generateFullItineraryFromPrompt(destination, concept, startDate, endDate, numPeople);
      const scheduleWithIds: ScheduleItem[] = result.schedule.map((item, index) => ({
        ...item,
        id: `ai-${Date.now()}-s-${index}`
      }));
      const checklistWithIds: UIChecklistItem[] = result.checklist.map((text, index) => ({
        id: `ai-${Date.now()}-c-${index}`,
        text,
        checked: false,
      }));
      onGenerate(scheduleWithIds, checklistWithIds);
    } catch (err: any) {
      setError(err.message || "일정 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 디바이스별 스타일 설정
  const getFormStyles = () => {
    if (isMobile) {
      return {
        container: "max-w-lg mx-auto bg-white p-4 rounded-2xl shadow-lg",
        title: "text-2xl font-bold text-slate-800 text-center",
        subtitle: "text-slate-500 mt-2 text-sm text-center",
        formSpacing: "space-y-4",
        inputPadding: "px-4 py-3",
        inputText: "text-base",
        buttonPadding: "py-4 px-4",
        buttonText: "text-base",
        iconSize: "h-5 w-5",
        gridLayout: "grid-cols-2",
        gridGap: "gap-3"
      };
    } else if (isTablet) {
      return {
        container: "max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg",
        title: "text-3xl font-bold text-slate-800 text-center",
        subtitle: "text-slate-500 mt-3 text-base text-center",
        formSpacing: "space-y-5",
        inputPadding: "px-5 py-4",
        inputText: "text-lg",
        buttonPadding: "py-4 px-6",
        buttonText: "text-lg",
        iconSize: "h-6 w-6",
        gridLayout: "grid-cols-2",
        gridGap: "gap-5"
      };
    } else {
      return {
        container: "max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg",
        title: "text-3xl font-bold text-slate-800 text-center",
        subtitle: "text-slate-500 mt-3 text-lg text-center",
        formSpacing: "space-y-6",
        inputPadding: "px-5 py-4",
        inputText: "text-lg",
        buttonPadding: "py-4 px-6",
        buttonText: "text-lg",
        iconSize: "h-6 w-6",
        gridLayout: "grid-cols-2",
        gridGap: "gap-6"
      };
    }
  };

  const formStyles = getFormStyles();

  return (
    <div className={formStyles.container}>
      <div className="text-center mb-6 lg:mb-10">
        <h2 className={formStyles.title}>J형 AI의 완벽여행 큐레이션</h2>
        <p className={formStyles.subtitle}>
          {isMobile 
            ? "정보만 입력하면 AI가 맞춤 여행을 설계해 드립니다."
            : "몇 가지 정보만 알려주시면 AI가 맞춤 여행을 설계해 드립니다."
          }
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">오류: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={formStyles.formSpacing}>
        <div>
          <label htmlFor="destination" className={`block text-sm ${layoutConfig.fontSize} font-medium text-slate-700 mb-2 lg:mb-3`}>여행지</label>
          <input type="text" id="destination" value={destination} onChange={e => setDestination(e.target.value)}
                 className={`w-full ${formStyles.inputPadding} border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formStyles.inputText}`}
                 placeholder="예: 서울, 제주도" required />
        </div>
        
        <div className={`grid ${formStyles.gridLayout} ${formStyles.gridGap}`}>
          <div>
            <label htmlFor="start-date" className={`block text-sm ${layoutConfig.fontSize} font-medium text-slate-700 mb-2 lg:mb-3`}>여행 시작일</label>
            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)}
                   className={`w-full ${formStyles.inputPadding} border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formStyles.inputText}`} required />
          </div>
          <div>
            <label htmlFor="end-date" className={`block text-sm ${layoutConfig.fontSize} font-medium text-slate-700 mb-2 lg:mb-3`}>여행 종료일</label>
            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)}
                   className={`w-full ${formStyles.inputPadding} border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formStyles.inputText}`} required />
          </div>
        </div>
        
        <div>
          <label htmlFor="concept" className={`block text-sm ${layoutConfig.fontSize} font-medium text-slate-700 mb-2 lg:mb-3`}>여행 컨셉 (선택)</label>
          <textarea id="concept" rows={isMobile ? 3 : 4} value={concept} onChange={e => setConcept(e.target.value)}
                    className={`w-full ${formStyles.inputPadding} border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formStyles.inputText} resize-none`}
                    placeholder={isMobile 
                      ? "예: 가족 힐링 여행, 맛집 탐방"
                      : "예: 3박 4일 가족 힐링 여행, 친구와 함께하는 맛집 탐방, 혼자 즐기는 역사 유적지 투어"
                    }></textarea>
        </div>
        
        <div>
          <label htmlFor="num-people" className={`block text-sm ${layoutConfig.fontSize} font-medium text-slate-700 mb-2 lg:mb-3`}>인원</label>
          <input type="number" id="num-people" value={numPeople} min="1" onChange={e => setNumPeople(e.target.value)}
                 className={`w-full ${formStyles.inputPadding} border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formStyles.inputText}`} required />
        </div>

        <button type="submit" disabled={isLoading}
                className={`w-full flex items-center justify-center bg-indigo-600 text-white font-bold ${formStyles.buttonPadding} rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 disabled:bg-indigo-400 ${formStyles.buttonText}`}>
          {isLoading ? <div className={`animate-spin rounded-full ${formStyles.iconSize} border-b-2 border-white`}></div> : <SparklesIcon className={formStyles.iconSize} />}
          <span className="ml-2">{isLoading ? '일정 생성 중...' : 'AI로 일정 추천받기'}</span>
        </button>
      </form>
      
      <CoupangCarouselAd />
    </div>
  );
};

export default AIGenerator;
