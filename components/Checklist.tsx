import React, { useState } from 'react';
import type { UIChecklistItem } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from './Icons';
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
    <div className="space-y-2">
      {checklist.length > 0 ? (
        checklist.map(item => (
          <div key={item.id} className="flex items-center bg-slate-100 p-3 rounded-lg shadow-sm">
            {editingItemId === item.id ? (
              <>
                <input
                  type="text"
                  value={editingItemText}
                  onChange={(e) => setEditingItemText(e.target.value)}
                  className="flex-grow bg-white border border-indigo-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                />
                <div className="flex-shrink-0 ml-2 flex items-center">
                    <button onClick={saveEditing} className="p-1 text-slate-500 hover:text-green-600" aria-label="저장"><CheckIcon /></button>
                    <button onClick={cancelEditing} className="p-1 text-slate-500 hover:text-red-600" aria-label="취소"><XMarkIcon /></button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  id={`checklist-${item.id}`}
                  checked={item.checked}
                  onChange={() => handleToggleCheck(item.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor={`checklist-${item.id}`}
                  className={`ml-3 flex-grow block text-sm font-medium text-slate-800 transition-colors cursor-pointer ${
                    item.checked ? 'line-through text-slate-500' : ''
                  }`}
                >
                  {item.text}
                </label>
                 <div className="flex-shrink-0 ml-2 flex items-center">
                    <button onClick={() => startEditing(item)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" aria-label="수정"><PencilIcon /></button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" aria-label="삭제"><TrashIcon /></button>
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-slate-500 mt-4">준비물 목록이 비어있습니다. 일정을 서술하고 추가하면 AI가 추천해줍니다.</p>
      )}

      {checklist.length > 0 && (
        <div className="pt-4">
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
            >
                <PlusIcon />
                준비물 추가하기
            </button>
        </div>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="새 준비물 추가">
        <form onSubmit={handleAddItem} className="space-y-4">
            <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="새 준비물 내용..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                autoFocus
            />
            <div className="flex justify-end items-center gap-3">
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

export default Checklist;