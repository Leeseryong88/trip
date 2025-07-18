
import React, { useState } from 'react';
import type { ScheduleItem, UIChecklistItem, NearbyPlace } from '../types';
import ScheduleForm from './ScheduleForm';
import PreviewPane from './PreviewPane';
import { generateItineraryHtml, generateScheduleFromText, generateChecklistFromSchedule } from '../services/geminiService';
import { SparklesIcon, DownloadIcon } from './Icons';
import NearbyFinderModal from './NearbyFinderModal';

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

  const [isNearbyFinderOpen, setIsNearbyFinderOpen] = useState(false);
  const [currentTargetItem, setCurrentTargetItem] = useState<ScheduleItem | null>(null);

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
    try {
      const checklistText = checklist.map(item => item.text);
      const html = await generateItineraryHtml(schedule, checklistText);
      setGeneratedHtml(html);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ height: 'calc(100vh - 230px)' }}>
        <div className="flex flex-col gap-6">
          <ScheduleForm
            schedule={schedule}
            setSchedule={setSchedule}
            checklist={checklist}
            setChecklist={setChecklist}
            handleNarrativeAdd={handleNarrativeAdd}
            isParsing={isParsing}
            narrativeError={narrativeError}
            onOpenNearbyFinder={handleOpenNearbyFinder}
          />
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading || schedule.length === 0}
              className="flex-1 flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              <SparklesIcon />
              <span className="ml-2">{isLoading ? 'HTML 생성 중...' : '미리보기/HTML 생성'}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={!generatedHtml || isLoading}
              className="flex-1 flex items-center justify-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              <DownloadIcon />
              <span className="ml-2">HTML 다운로드</span>
            </button>
          </div>
        </div>
        <PreviewPane htmlContent={generatedHtml} isLoading={isLoading} />
      </div>
      {currentTargetItem && (
        <NearbyFinderModal 
            isOpen={isNearbyFinderOpen}
            onClose={handleCloseNearbyFinder}
            targetItem={currentTargetItem}
            onAddToSchedule={handleAddToScheduleFromFinder}
        />
      )}
    </>
  );
};

export default ManualPlanner;