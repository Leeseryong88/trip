import React, { useState } from 'react';
import type { ScheduleItem, UIChecklistItem } from './types';
import AIGenerator from './components/AIGenerator';
import ManualPlanner from './components/ManualPlanner';
import SelectionScreen from './components/SelectionScreen';
import AIReviewScreen from './components/AIReviewScreen';

function App() {
  const [mode, setMode] = useState<'selection' | 'ai' | 'manual' | 'review'>('selection');
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
    setMode('selection');
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
      case 'selection':
      default:
        return (
          <SelectionScreen
            onSelectAI={() => setMode('ai')}
            onSelectManual={() => {
              setSchedule([]);
              setChecklist([]);
              setMode('manual');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600 cursor-pointer" onClick={startNewPlan} title="새 계획 시작">
            플래닛 (Plan-it)
          </h1>
          {mode !== 'selection' && (
            <button
              onClick={startNewPlan}
              className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              새 계획 시작
            </button>
          )}
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div 
          className={mode === 'selection' ? 'flex items-center justify-center' : ''}
          style={mode === 'selection' ? { minHeight: 'calc(100vh - 150px)' } : {}}
        >
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;