import React, { useState } from 'react';
import type { ScheduleItem, UIChecklistItem, NearbyPlace } from '../types';
import ScheduleForm from './ScheduleForm';
import { generateItineraryHtml, generateScheduleFromText, generateChecklistFromSchedule } from '../services/geminiService';
import { SparklesIcon, DownloadIcon } from './Icons';
import NearbyFinderModal from './NearbyFinderModal';
import Modal from './Modal';

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


  const handleGenerate = async () => {
    if (schedule.length === 0) {
      setError("일정을 생성하기 전에 하나 이상의 항목을 추가해주세요.");
      return;
    }
    setError(null);
    setNarrativeError(null);
    setIsLoading(true);
    setGeneratedHtml('');
    setIsPreviewModalOpen(true); // Open modal to show loading state

    try {
      const checklistText = checklist.map(item => item.text);
      const html = await generateItineraryHtml(schedule, checklistText);
      setGeneratedHtml(html);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
      setIsPreviewModalOpen(false); // Close modal on error
    } finally {
      setIsLoading(false);
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
      {/* Revised layout for single-column view */}
      <div className="max-w-3xl mx-auto w-full">
         {/* Container with explicit height to make form scrollable */}
        <div style={{ height: 'calc(100vh - 180px)' }}>
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
        {/* Action buttons are outside the scrolling container */}
        <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleGenerate}
              disabled={isLoading || schedule.length === 0}
              className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              <SparklesIcon />
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
        title="일정 미리보기"
        size="fullscreen"
        headerActions={
          <button
            onClick={handleDownload}
            disabled={!generatedHtml || isLoading}
            className="flex items-center justify-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-green-300 disabled:cursor-not-allowed text-sm"
          >
            <DownloadIcon className="w-5 h-5" />
            <span className="ml-2">스케쥴 파일로 받기</span>
          </button>
        }
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <SparklesIcon className="h-12 w-12 animate-spin text-slate-500" />
            <p className="mt-4 text-slate-600 font-semibold">
              일정을 생성중입니다.
              <br />
              이 작업은 최대 2분 이상 소요될 수 있습니다.
            </p>
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