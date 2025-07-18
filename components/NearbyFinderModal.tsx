import React, { useState } from 'react';
import type { ScheduleItem, NearbyPlace } from '../types';
import { findNearbyPlaces } from '../services/geminiService';
import Modal from './Modal';
import { PlusIcon, MapPinIcon } from './Icons';

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

  const handleViewOnMap = (place: NearbyPlace) => {
    const query = encodeURIComponent(`${place.name}, ${place.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

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
            
            <div className="mt-4" style={{minHeight: '40vh', maxHeight: '50vh', overflowY: 'auto' }}>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="mt-3 text-slate-500 text-sm">AI가 주변 {placeType}을(를) 찾고 있습니다...</p>
                    </div>
                )}
                {error && !isLoading && <p className="text-sm text-red-600 text-center p-4">{error}</p>}
                
                {!isLoading && !error && results.length > 0 && (
                    <div className="space-y-3">
                        {results.map((place, index) => (
                            <div 
                                key={index} 
                                className="p-4 rounded-lg bg-slate-100"
                            >
                                <h4 className="font-bold text-slate-800">{place.name}</h4>
                                <p className="text-sm text-slate-600 mt-1 mb-3">{place.description}</p>
                                <p className="text-xs text-slate-500 mt-1 flex items-center">
                                  <MapPinIcon className="inline-block h-4 w-4 mr-1 flex-shrink-0" />
                                  <span>{place.address}</span>
                                </p>
                                <div className="flex items-center justify-end gap-2 mt-3">
                                    <button 
                                      onClick={() => handleViewOnMap(place)}
                                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
                                    >
                                        지도에서 보기
                                    </button>
                                    <button 
                                      onClick={() => onAddToSchedule(place, targetItem)}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        일정에 추가
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {!isLoading && !error && results.length === 0 && placeType && (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-center text-slate-500 text-sm p-4">추천 장소를 찾지 못했습니다.</p>
                     </div>
                 )}
            </div>
        </div>
    </Modal>
  );
};

export default NearbyFinderModal;
