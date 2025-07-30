import React, { useState } from 'react';
import type { UIChecklistItem } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon, ShoppingCartIcon } from './Icons';
import Modal from './Modal';

interface ChecklistProps {
  checklist: UIChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<UIChecklistItem[]>>;
}

const Checklist: React.FC<ChecklistProps> = ({ checklist, setChecklist }) => {
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const affiliateTag = "AF4903034";

  const handleToggleCheck = (id: string) => {
    setChecklist(
      checklist.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem: UIChecklistItem = {
      id: `check-${Date.now()}`,
      text: newItemText,
      checked: false,
    };
    setChecklist([...checklist, newItem]);
    setNewItemText('');
    setIsAddModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const startEditing = (item: UIChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const saveEditing = () => {
    if (!editingItemId) return;
    setChecklist(
      checklist.map(item =>
        item.id === editingItemId ? { ...item, text: editingItemText } : item
      )
    );
    setEditingItemId(null);
    setEditingItemText('');
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingItemText('');
  };

  return (
    <div className="space-y-3 lg:space-y-4">
      {checklist.length > 0 ? (
        checklist.map(item => (
          editingItemId === item.id ? (
            <div key={item.id} className="flex items-center bg-indigo-50 p-3 lg:p-4 rounded-lg shadow-sm border border-indigo-200">
              <input
                type="text"
                value={editingItemText}
                onChange={(e) => setEditingItemText(e.target.value)}
                className="flex-grow mr-2 lg:mr-3 p-2 lg:p-3 border border-slate-300 rounded-lg text-base lg:text-lg"
                autoFocus
              />
              <button onClick={saveEditing} className="p-2 lg:p-3 text-slate-500 hover:text-green-600 min-h-10 min-w-10 lg:min-h-12 lg:min-w-12" aria-label="저장">
                <CheckIcon className="lg:h-5 lg:w-5" />
              </button>
              <button onClick={cancelEditing} className="p-2 lg:p-3 text-slate-500 hover:text-red-600 min-h-10 min-w-10 lg:min-h-12 lg:min-w-12" aria-label="취소">
                <XMarkIcon className="lg:h-5 lg:w-5" />
              </button>
            </div>
          ) : (
            <div key={item.id} className="flex items-center bg-slate-100 p-3 lg:p-4 rounded-lg shadow-sm">
              <input
                type="checkbox"
                id={`checklist-${item.id}`}
                checked={item.checked}
                onChange={() => handleToggleCheck(item.id)}
                className="h-4 w-4 lg:h-5 lg:w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3 lg:mr-4 flex-shrink-0"
              />
              <label
                htmlFor={`checklist-${item.id}`}
                className={`flex-grow text-sm lg:text-base ${item.checked ? 'line-through text-slate-500' : 'text-slate-800'}`}
              >
                {item.text}
              </label>
              <a
                href={`https://www.coupang.com/np/search?q=${encodeURIComponent(item.text)}&lptag=${affiliateTag}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 lg:p-3 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full flex-shrink-0 min-h-10 min-w-10 lg:min-h-12 lg:min-w-12"
                aria-label={`${item.text} 쿠팡에서 구매하기`}
                title="쿠팡에서 구매하기"
              >
                <ShoppingCartIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              </a>
              <button onClick={() => startEditing(item)} className="p-2 lg:p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full min-h-10 min-w-10 lg:min-h-12 lg:min-w-12" aria-label="수정">
                <PencilIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
              <button onClick={() => handleDeleteItem(item.id)} className="p-2 lg:p-3 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full min-h-10 min-w-10 lg:min-h-12 lg:min-w-12" aria-label="삭제">
                <TrashIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
            </div>
          )
        ))
      ) : (
        <div className="text-center py-8 lg:py-12">
          <p className="text-slate-500 mb-4 lg:mb-6 text-sm lg:text-base">준비물 목록이 비어있습니다.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center bg-indigo-600 text-white font-bold py-2 lg:py-3 px-4 lg:px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-sm lg:text-base"
          >
            <PlusIcon className="mr-2 lg:h-5 lg:w-5" />
            첫 준비물 추가하기
          </button>
        </div>
      )}

      {checklist.length > 0 && (
        <div className="pt-4 lg:pt-6">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-700 font-bold py-2 lg:py-3 px-4 lg:px-6 rounded-lg hover:bg-slate-300 transition-colors text-sm lg:text-base"
          >
            <PlusIcon className="lg:h-5 lg:w-5" />
            준비물 추가하기
          </button>
        </div>
      )}

      {checklist.length > 0 && (
        <p className="mt-4 lg:mt-6 text-xs lg:text-sm text-slate-500 italic">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="새 준비물 추가">
        <form onSubmit={handleAddItem}>
          <div className="space-y-3 lg:space-y-4">
            <p className="text-sm lg:text-base text-slate-600">준비물을 입력하세요.</p>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="준비물 (예: 여권, 선크림, 충전기)"
              className="w-full text-base p-3 lg:p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end items-center gap-3 mt-6 lg:mt-8">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 lg:gap-2"
            >
              <PlusIcon className="lg:h-5 lg:w-5" />
              <span>추가</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Checklist;