import React, { useState } from 'react';
import type { ScheduleItem, UIChecklistItem } from './types';
import AIGenerator from './components/AIGenerator';
import ManualPlanner from './components/ManualPlanner';
import AIReviewScreen from './components/AIReviewScreen';
import { Analytics } from '@vercel/analytics/react';
import { useResponsiveLayout } from './services/deviceDetection';

function App() {
  const [mode, setMode] = useState<'ai' | 'manual' | 'review'>('ai');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [checklist, setChecklist] = useState<UIChecklistItem[]>([]);
  
  // 디바이스 정보와 레이아웃 설정 가져오기
  const { deviceInfo, layoutConfig, isMobile, isTablet, isDesktop } = useResponsiveLayout();

  const handleAIGeneration = (newSchedule: ScheduleItem[], newChecklist: UIChecklistItem[]) => {
    setSchedule(newSchedule);
    setChecklist(newChecklist);
    setMode('review');
  };
  
  const handleReviewConfirm = () => {
    setMode('manual');
  };

  const startNewPlan = () => {
    setSchedule([]);
    setChecklist([]);
    setMode('ai');
  };

  const renderContent = () => {
    switch (mode) {
      case 'ai':
        return <AIGenerator onGenerate={handleAIGeneration} />;
      case 'review':
        return (
          <AIReviewScreen 
            schedule={schedule}
            checklist={checklist}
            onConfirm={handleReviewConfirm}
          />
        );
      case 'manual':
        return (
          <ManualPlanner
            schedule={schedule}
            setSchedule={setSchedule}
            checklist={checklist}
            setChecklist={setChecklist}
          />
        );
      default:
        return <AIGenerator onGenerate={handleAIGeneration} />;
    }
  };

  // 디바이스별 헤더 스타일
  const getHeaderStyles = () => {
    if (isMobile) {
      return {
        container: "container mx-auto px-4 py-3 flex flex-col items-center gap-3",
        title: "text-2xl font-bold text-slate-800 tracking-tight cursor-pointer",
        button: "px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors w-full"
      };
    } else if (isTablet) {
      return {
        container: "container mx-auto px-6 py-4 flex flex-row justify-between items-center",
        title: "text-3xl font-bold text-slate-800 tracking-tight cursor-pointer",
        button: "px-5 py-2 text-base font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
      };
    } else {
      return {
        container: "container mx-auto px-8 py-6 flex flex-row justify-between items-center",
        title: "text-4xl font-bold text-slate-800 tracking-tight cursor-pointer",
        button: "px-6 py-3 text-base font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
      };
    }
  };

  const headerStyles = getHeaderStyles();

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-white shadow-md">
        <div className={headerStyles.container}>
          <h1 
            className={headerStyles.title}
            onClick={startNewPlan}
            title="새 계획 시작"
          >
            여행가J
          </h1>
          <button
            onClick={startNewPlan}
            className={headerStyles.button}
          >
            새로운 계획 시작
          </button>
        </div>
      </header>
      
      <main className={`container mx-auto ${layoutConfig.containerPadding} ${layoutConfig.maxWidth}`}>
        {renderContent()}
      </main>
      
      <Analytics />
    </div>
  );
}

export default App;