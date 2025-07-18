import React, { useState } from 'react';
import type { ScheduleItem, NearbyPlace } from '../types';
import { findNearbyPlaces } from '../services/geminiService';
import Modal from './Modal';
import { PlusIcon } from './Icons';

interface NearbyFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: ScheduleItem;
  onAddToSchedule: (place: NearbyPlace, originalItem: ScheduleItem) => void;
}

const NearbyFinderModal: React.FC<NearbyFinderModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  onAddToSchedule,
}) => {
  const [placeType, setPlaceType] = useState<'맛집' | '명소' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<NearbyPlace[]>([]);

  const handleFindPlaces = async (type: '맛집' | '명소') => {
    if (!targetItem.location) {
      setError("기준 장소 정보가 없습니다.");
      return;
    }
    setPlaceType(type);
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const places = await findNearbyPlaces(targetItem.location, type);
      setResults(places);
    } catch (err: any) {
      setError(err.message || '장소를 찾지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setPlaceType(null);
    setResults([]);
    setError(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`'${targetItem.location}' 주변 장소 찾기`}>
        <div className="space-y-4">
            <p className="text-sm text-slate-600">
                어떤 종류의 장소를 추천해 드릴까요?
            </p>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleFindPlaces('맛집')}
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-amber-400"
                >
                    맛집 추천
                </button>
                <button
                    onClick={() => handleFindPlaces('명소')}
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-teal-400"
                >
                    명소 추천
                </button>
            </div>
            
            <div className="mt-4 min-h-[200px]">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="mt-3 text-slate-500 text-sm">AI가 주변 {placeType}을(를) 찾고 있습니다...</p>
                    </div>
                )}
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                
                {results.length > 0 && (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 -mr-2">
                        {results.map((place, index) => (
                            <div key={index} className="bg-slate-100 p-3 rounded-lg flex items-start justify-between gap-2">
                                <div className="flex-grow">
                                    <h4 className="font-bold text-slate-800">{place.name}</h4>
                                    <p className="text-sm text-slate-600 mt-1">{place.description}</p>
                                </div>
                                <button
                                    onClick={() => onAddToSchedule(place, targetItem)}
                                    className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md hover:bg-indigo-200 transition-colors"
                                    title="이 장소를 일정에 추가"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>추가</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </Modal>
  );
};

export default NearbyFinderModal;
