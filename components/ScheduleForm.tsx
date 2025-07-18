import React, { useState } from 'react';
import type { ScheduleItem, UIChecklistItem } from '../types';
import { TrashIcon, SparklesIcon, ClipboardListIcon, PencilIcon, CheckIcon, XMarkIcon, PlusIcon, MapPinIcon, ExternalLinkIcon } from './Icons';
import Checklist from './Checklist';
import Modal from './Modal';

interface ScheduleFormProps {
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  checklist: UIChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<UIChecklistItem[]>>;
  handleNarrativeAdd: (content: string) => Promise<void>;
  isParsing: boolean;
  narrativeError: string | null;
  onOpenNearbyFinder: (item: ScheduleItem) => void;
  showNarrativeInput: boolean;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  setSchedule,
  checklist,
  setChecklist,
  handleNarrativeAdd,
  isParsing,
  narrativeError,
  onOpenNearbyFinder,
  showNarrativeInput,
}) => {
  const [narrativeContent, setNarrativeContent] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'checklist'>('schedule');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItemData, setEditedItemData] = useState<ScheduleItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    date: '', time: '', activity: '', cost: '', location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrativeContent.trim()) return;
    await handleNarrativeAdd(narrativeContent);
    setNarrativeContent('');
    setActiveTab('schedule');
  };

  const startEditing = (item: ScheduleItem) => {
    setEditingItemId(item.id);
    setEditedItemData({ ...item });
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditedItemData(null);
  };

  const saveEditing = () => {
    if (!editedItemData) return;
    setSchedule(
      schedule.map(item => (item.id === editingItemId ? editedItemData : item))
    );
    cancelEditing();
  };
  
  const handleFieldChange = (field: keyof Omit<ScheduleItem, 'id'>, value: string) => {
      if(editedItemData) {
        setEditedItemData({ ...editedItemData, [field]: value });
      }
  };

  const handleDeleteItem = (id: string) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };
  
  const handleManualAddChange = (field: keyof typeof newItem, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleManualAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.activity || !newItem.date || !newItem.time) {
      alert("날짜, 시간, 활동은 필수 항목입니다.");
      return;
    }
    const newItemWithId: ScheduleItem = {
      id: `manual-${Date.now()}`,
      ...newItem
    };
    setSchedule([...schedule, newItemWithId]);
    setNewItem({ date: '', time: '', activity: '', cost: '', location: '' });
    setIsAddModalOpen(false);
  };

  const sortedSchedule = [...schedule].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return dateA - dateB;
  });

  const getTabClassName = (tabName: 'schedule' | 'checklist') => {
    const isActive = activeTab === tabName;
    return `
      px-3 py-2 font-medium text-sm rounded-md cursor-pointer flex items-center gap-2
      ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}
    `;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">나의 여행 정보</h2>
      
      {showNarrativeInput && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label htmlFor="narrative-area" className="block text-sm font-medium text-slate-600 mb-1">여행 계획을 서술해주세요</label>
            <textarea 
              id="narrative-area"
              rows={5}
              value={narrativeContent}
              onChange={e => setNarrativeContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="자유롭게 일정을 설명해주세요. AI가 일정과 준비물을 자동으로 정리해줍니다.&#10;예: 내일 오전 10시에 경복궁에 갈거야. 그리고 저녁 7시 비행기로 제주도로 출발해."
            />
          </div>
          {narrativeError && <p className="text-sm text-red-600 mb-3">{narrativeError}</p>}
          <button
            type="submit"
            disabled={isParsing}
            className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 disabled:bg-indigo-400"
          >
            {isParsing ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <SparklesIcon />}
            <span className="ml-2">{isParsing ? '분석 중...' : '일정 및 준비물 추가'}</span>
          </button>
        </form>
      )}

      <div className="border-b border-slate-200">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button onClick={() => setActiveTab('schedule')} className={getTabClassName('schedule')}>
            <span>일정 목록</span>
            <span className="bg-slate-200 text-slate-600 text-xs font-mono px-2 py-0.5 rounded-full">{schedule.length}</span>
          </button>
          <button onClick={() => setActiveTab('checklist')} className={getTabClassName('checklist')}>
            <ClipboardListIcon />
            <span>준비물</span>
             <span className="bg-slate-200 text-slate-600 text-xs font-mono px-2 py-0.5 rounded-full">{checklist.length}</span>
          </button>
        </nav>
      </div>

      <div className="flex-grow overflow-y-auto pt-4 pr-2 -mr-2">
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            {sortedSchedule.length > 0 ? sortedSchedule.map(item => (
                editingItemId === item.id && editedItemData ? (
                <li key={item.id} className="bg-indigo-50 p-3 rounded-lg shadow-sm border border-indigo-200 list-none">
                    <div className="space-y-2">
                         <input type="text" value={editedItemData.activity} onChange={e => handleFieldChange('activity', e.target.value)} placeholder="활동" className="w-full text-sm p-1 border rounded" />
                         <div className="flex gap-2">
                            <input type="date" value={editedItemData.date} onChange={e => handleFieldChange('date', e.target.value)} className="w-full text-sm p-1 border rounded" />
                            <input type="time" value={editedItemData.time} onChange={e => handleFieldChange('time', e.target.value)} className="w-full text-sm p-1 border rounded" />
                         </div>
                         <input type="text" value={editedItemData.location || ''} onChange={e => handleFieldChange('location', e.target.value)} placeholder="장소" className="w-full text-sm p-1 border rounded" />
                         <input type="text" value={editedItemData.cost || ''} onChange={e => handleFieldChange('cost', e.target.value)} placeholder="비용" className="w-full text-sm p-1 border rounded" />
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={saveEditing} className="p-1 text-slate-500 hover:text-green-600" aria-label="저장"><CheckIcon /></button>
                        <button onClick={cancelEditing} className="p-1 text-slate-500 hover:text-red-600" aria-label="취소"><XMarkIcon /></button>
                    </div>
                </li>
                ) : (
                <li key={item.id} className="flex items-center justify-between bg-slate-100 p-3 rounded-lg shadow-sm list-none">
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <p className="font-semibold text-slate-800 truncate pr-2">{item.activity}</p>
                            {item.cost && <p className="text-sm font-medium text-green-600 whitespace-nowrap">{item.cost}</p>}
                        </div>
                        <p className="text-sm text-slate-500">{item.date} {item.time}</p>
                        {item.location && (
                            <div className="flex items-center text-sm text-slate-600 mt-1">
                                <span className="truncate">장소: {item.location}</span>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-1.5 flex-shrink-0 p-1 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                                    title="지도에서 위치 보기"
                                >
                                    <ExternalLinkIcon className="h-4 w-4" />
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="flex-shrink-0 ml-4 flex items-center">
                        {item.location && (
                           <button onClick={() => onOpenNearbyFinder(item)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full" aria-label="주변 장소 찾기" title="주변 장소 찾기"><MapPinIcon /></button>
                        )}
                        <button onClick={() => startEditing(item)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" aria-label="일정 수정"><PencilIcon /></button>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" aria-label="일정 삭제"><TrashIcon /></button>
                    </div>
                </li>
                )
            )) : (
              <p className="text-center text-slate-500 mt-4">일정을 추가하여 시작하세요.</p>
            )}
            {schedule.length > 0 && (
                <div className="pt-4">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        <PlusIcon />
                        일정 추가하기
                    </button>
                </div>
            )}
          </div>
        )}
        {activeTab === 'checklist' && (
          <Checklist checklist={checklist} setChecklist={setChecklist} />
        )}
      </div>

       <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="새 일정 추가">
          <form onSubmit={handleManualAddItem}>
              <div className="space-y-3">
                  <p className="text-sm text-slate-600">새로운 일정 정보를 입력하세요.</p>
                  <input type="text" value={newItem.activity} onChange={e => handleManualAddChange('activity', e.target.value)} placeholder="활동 (필수)" className="w-full text-sm p-2 border border-slate-300 rounded-lg" required/>
                  <div className="flex gap-3">
                      <input type="date" value={newItem.date} onChange={e => handleManualAddChange('date', e.target.value)} className="w-full text-sm p-2 border border-slate-300 rounded-lg" required/>
                      <input type="time" value={newItem.time} onChange={e => handleManualAddChange('time', e.target.value)} className="w-full text-sm p-2 border border-slate-300 rounded-lg" required/>
                  </div>
                  <input type="text" value={newItem.location} onChange={e => handleManualAddChange('location', e.target.value)} placeholder="장소" className="w-full text-sm p-2 border border-slate-300 rounded-lg" />
                  <input type="text" value={newItem.cost} onChange={e => handleManualAddChange('cost', e.target.value)} placeholder="비용" className="w-full text-sm p-2 border border-slate-300 rounded-lg" />
              </div>
              <div className="flex justify-end items-center gap-3 mt-6">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                      취소
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      <PlusIcon/>
                      <span>추가</span>
                  </button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default ScheduleForm;