

import React, { useState, useEffect, useRef } from 'react';
import type { ScheduleItem, UIChecklistItem, NearbyPlace } from '../types';
import ScheduleForm from './ScheduleForm';
import { generateItineraryHtml, generateScheduleFromText, generateChecklistFromSchedule } from '../services/geminiService';
import { SparklesIcon, DownloadIcon } from './Icons';
import NearbyFinderModal from './NearbyFinderModal';
import Modal from './Modal';
import { travelQuotes } from '../services/travelQuotes';
import CoupangCarouselAd from './CoupangCarouselAd';
import { useResponsiveLayout } from '../services/deviceDetection';

declare var saveAs: (blob: Blob, filename: string) => void;

interface ManualPlannerProps {
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  checklist: UIChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<UIChecklistItem[]>>;
}

const ManualPlanner: React.FC<ManualPlannerProps> = ({ schedule, setSchedule, checklist, setChecklist }) => {
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState<string>('');
  
  // 디바이스 정보와 레이아웃 설정 가져오기
  const { deviceInfo, layoutConfig, isMobile, isTablet, isDesktop } = useResponsiveLayout();
  
  const [progress, setProgress] = useState(0);
  const [showOvertimeMessage, setShowOvertimeMessage] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(2 * 60 * 1000); // 기본 2분
  const [loadingDurationMinutes, setLoadingDurationMinutes] = useState(2);
  const timerRef = useRef<{ interval?: number; timeout?: number }>({});

  useEffect(() => {
    if (isLoading) {
      setCurrentQuote(travelQuotes[Math.floor(Math.random() * travelQuotes.length)]);
      const intervalId = setInterval(() => {
        setCurrentQuote(travelQuotes[Math.floor(Math.random() * travelQuotes.length)]);
      }, 10000);
      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  useEffect(() => {
    const clearTimers = () => {
        if (timerRef.current.interval) clearInterval(timerRef.current.interval);
        if (timerRef.current.timeout) clearTimeout(timerRef.current.timeout);
        timerRef.current = {};
    };
    
    if (isLoading) {
        setProgress(0);
        setShowOvertimeMessage(false);

        const DURATION = loadingDuration;
        const UPDATE_INTERVAL = 250;
        const STEPS = DURATION / UPDATE_INTERVAL;
        const increment = 100 / STEPS;

        timerRef.current.interval = window.setInterval(() => {
            setProgress(p => Math.min(p + increment, 99));
        }, UPDATE_INTERVAL);

        timerRef.current.timeout = window.setTimeout(() => {
            setShowOvertimeMessage(true);
        }, DURATION);
    } else {
        clearTimers();
    }

    return clearTimers;
  }, [isLoading, loadingDuration]);


  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [isNearbyFinderOpen, setIsNearbyFinderOpen] = useState(false);
  const [currentTargetItem, setCurrentTargetItem] = useState<ScheduleItem | null>(null);
  const [showNarrative] = useState(() => schedule.length === 0);

  const handleNarrativeAdd = async (narrativeContent: string) => {
    if (!narrativeContent.trim()) return;
    
    setIsParsing(true);
    setNarrativeError(null);
    setError(null);
    try {
      const newScheduleItems = await generateScheduleFromText(narrativeContent);
      if (newScheduleItems.length === 0) {
        setNarrativeError("설명에서 일정 항목을 찾을 수 없습니다. 날짜, 시간, 활동을 더 구체적으로 작성해보세요.");
        return;
      }
      const newScheduleWithIds: ScheduleItem[] = newScheduleItems.map((item, index) => ({
        ...item,
        id: `${new Date().toISOString()}-schedule-${index}-${Math.random()}`,
      }));
      setSchedule(prev => [...prev, ...newScheduleWithIds]);
      
      const newChecklistText = await generateChecklistFromSchedule(newScheduleItems);
      const newChecklistItems: UIChecklistItem[] = newChecklistText.map((text, index) => ({
        text,
        id: `${new Date().toISOString()}-check-${index}-${Math.random()}`,
        checked: false,
      }));

      setChecklist(prev => {
        const existingItems = new Set(prev.map(i => i.text));
        const uniqueNewItems = newChecklistItems.filter(i => !existingItems.has(i.text));
        return [...prev, ...uniqueNewItems];
      });

    } catch (err: any) {
      setNarrativeError(err.message || "분석 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsParsing(false);
    }
  };

  // 디바이스별 스타일 설정
  const getLayoutStyles = () => {
    if (isMobile) {
      return {
        container: "max-w-full mx-auto w-full px-3",
        height: "min-h-[400px]",
        buttonContainer: "flex items-center gap-3 mt-4 px-3",
        buttonClass: "w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed text-base",
        iconSize: "h-5 w-5"
      };
    } else if (isTablet) {
      return {
        container: "max-w-4xl mx-auto w-full px-4",
        height: "min-h-[500px]",
        buttonContainer: "flex items-center gap-4 mt-6 px-4",
        buttonClass: "w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed text-lg",
        iconSize: "h-6 w-6"
      };
    } else {
      return {
        container: "max-w-5xl mx-auto w-full px-4 lg:px-0",
        height: "min-h-[500px]",
        buttonContainer: "flex items-center gap-4 mt-6 px-4 lg:px-0",
        buttonClass: "w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed text-lg",
        iconSize: "h-6 w-6"
      };
    }
  };

  const layoutStyles = getLayoutStyles();

  const handleGenerate = async () => {
    if (schedule.length === 0) {
      setError("일정을 생성하기 전에 하나 이상의 항목을 추가해주세요.");
      return;
    }
    
    // 여행 기간에 따라 동적으로 로딩 시간 계산
    const uniqueDates = new Set(schedule.map(item => item.date));
    const numberOfDays = uniqueDates.size > 0 ? uniqueDates.size : 1;
    
    let durationInMinutes;
    if (numberOfDays <= 2) {
        durationInMinutes = 2;
    } else {
        durationInMinutes = 2 + (numberOfDays - 2);
    }
    durationInMinutes = Math.min(durationInMinutes, 7); // 최대 7분
    
    setLoadingDurationMinutes(durationInMinutes);
    setLoadingDuration(durationInMinutes * 60 * 1000);

    setError(null);
    setNarrativeError(null);
    setIsLoading(true);
    setGeneratedHtml('');
    setIsPreviewModalOpen(true);

    try {
      const checklistText = checklist.map(item => item.text);
      const html = await generateItineraryHtml(schedule, checklistText);
      
      if (timerRef.current.interval) clearInterval(timerRef.current.interval);
      if (timerRef.current.timeout) clearTimeout(timerRef.current.timeout);
      setShowOvertimeMessage(false);

      const fillInterval = setInterval(() => {
          setProgress(p => {
              const nextProgress = p + 5;
              if (nextProgress >= 100) {
                  clearInterval(fillInterval);
                  setGeneratedHtml(html);
                  setIsLoading(false);
                  return 100;
              }
              return nextProgress;
          });
      }, 30);

    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
      setIsLoading(false);
      setIsPreviewModalOpen(false);
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    saveAs(blob, '여행-일정.html');
  };
  
  const handleOpenNearbyFinder = (item: ScheduleItem) => {
    setCurrentTargetItem(item);
    setIsNearbyFinderOpen(true);
  };

  const handleCloseNearbyFinder = () => {
    setIsNearbyFinderOpen(false);
    setCurrentTargetItem(null);
  };

  const handleAddToScheduleFromFinder = (place: NearbyPlace, originalItem: ScheduleItem) => {
    const newScheduleItem: ScheduleItem = {
      id: `nearby-${Date.now()}-${Math.random()}`,
      date: originalItem.date,
      time: originalItem.time, // 사용자가 수정할 수 있도록 원본 시간 유지
      activity: `${place.name} 방문`,
      location: place.name,
      cost: '',
    };
    setSchedule(prev => [...prev, newScheduleItem].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
        return dateA - dateB;
    }));
    handleCloseNearbyFinder();
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <p className="font-bold">오류</p>
          <p>{error}</p>
        </div>
      )}
      <div className={layoutStyles.container}>
        <div style={{ height: 'calc(100vh - 200px)' }} className={layoutStyles.height}>
          <ScheduleForm
            schedule={schedule}
            setSchedule={setSchedule}
            checklist={checklist}
            setChecklist={setChecklist}
            handleNarrativeAdd={handleNarrativeAdd}
            isParsing={isParsing}
            narrativeError={narrativeError}
            onOpenNearbyFinder={handleOpenNearbyFinder}
            showNarrativeInput={showNarrative}
          />
        </div>
        <div className={layoutStyles.buttonContainer}>
            <button
              onClick={handleGenerate}
              disabled={isLoading || schedule.length === 0}
              className={layoutStyles.buttonClass}
            >
              <SparklesIcon className={layoutStyles.iconSize} />
              <span className="ml-2">{isLoading ? '여행스케쥴 생성 중...' : '여행스케쥴 생성하기'}</span>
            </button>
        </div>
      </div>
      
      {currentTargetItem && (
        <NearbyFinderModal 
            isOpen={isNearbyFinderOpen}
            onClose={handleCloseNearbyFinder}
            targetItem={currentTargetItem}
            onAddToSchedule={handleAddToScheduleFromFinder}
        />
      )}

      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={isLoading ? "여행 계획 생성 중" : "일정 미리보기"}
        size="fullscreen"
        headerActions={
          !isLoading && (
            <button
              onClick={handleDownload}
              disabled={!generatedHtml}
              className="flex items-center justify-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-green-300 disabled:cursor-not-allowed text-sm"
            >
              <DownloadIcon className="w-5 h-5" />
              <span className="ml-2">스케쥴 파일로 받기</span>
            </button>
          )
        }
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-full max-w-lg mx-auto">
                  <div className="flex justify-between items-end mb-2">
                      <span className={`font-bold text-slate-800 ${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-xl'}`}>
                          {showOvertimeMessage ? "추가적인 보정 작업중입니다." : "AI가 최적의 일정을 만들고 있어요."}
                      </span>
                      <span className={`font-bold text-indigo-600 ${isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-lg'}`}>{Math.floor(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                      <div 
                          className="bg-indigo-600 h-4 rounded-full transition-all duration-200 ease-linear" 
                          style={{ width: `${progress}%` }}
                      ></div>
                  </div>
                  <p className={`mt-4 text-slate-500 ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {showOvertimeMessage 
                          ? "완벽한 여행을 위해 마지막 세부 사항을 다듬고 있습니다. 거의 다 됐어요!"
                          : `이 작업은 최대 ${loadingDurationMinutes}분 정도 소요될 수 있습니다. 잠시만 기다려주세요.`
                      }
                  </p>
              </div>
              <p className={`mt-12 text-slate-500 italic px-4 ${isMobile ? 'text-sm' : 'text-base'}`}>"{currentQuote}"</p>
              <CoupangCarouselAd />
          </div>
        ) : generatedHtml ? (
          <iframe
            srcDoc={generatedHtml}
            title="일정 미리보기"
            className="w-full h-full border-0 bg-slate-200"
            sandbox="allow-scripts allow-popups"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500 p-4">
              <p className="font-semibold">오류가 발생했습니다.</p>
              <p className="text-sm mt-1">일정 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ManualPlanner;
