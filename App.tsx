import React, { useState } from 'react';
import type { ScheduleItem, UIChecklistItem } from './types';
import AIGenerator from './components/AIGenerator';
import ManualPlanner from './components/ManualPlanner';
import AIReviewScreen from './components/AIReviewScreen';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const [mode, setMode] = useState<'ai' | 'manual' | 'review'>('ai');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [checklist, setChecklist] = useState<UIChecklistItem[]>([]);

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

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 
            className="text-3xl font-bold text-slate-800 tracking-tight cursor-pointer"
            onClick={startNewPlan}
            title="새 계획 시작"
          >
            여행가J
          </h1>
          <button
            onClick={startNewPlan}
            className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            새로운 계획 시작
          </button>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      <Analytics />
    </div>
  );
}

export default App;