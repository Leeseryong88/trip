import React from 'react';
import type { ScheduleItem, UIChecklistItem } from '../types';
import { ExternalLinkIcon, ShoppingCartIcon } from './Icons';

interface AIReviewScreenProps {
  schedule: ScheduleItem[];
  checklist: UIChecklistItem[];
  onConfirm: () => void;
}

const AIReviewScreen: React.FC<AIReviewScreenProps> = ({ schedule, checklist, onConfirm }) => {
  // Group schedule items by date
  const groupedSchedule = schedule.reduce((acc, item) => {
    (acc[item.date] = acc[item.date] || []).push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const sortedDates = Object.keys(groupedSchedule).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const affiliateTag = "AF4903034";

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">AI 추천 여행 계획</h2>
        <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
          AI가 생성한 여행 계획을 확인해보세요. 마음에 드신다면 이 계획으로 편집을 시작하여 나만의 여행을 완성할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Schedule Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">상세 여행 일정</h3>
          <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 -mr-4">
            {sortedDates.length > 0 ? (
              sortedDates.map(date => (
                <div key={date}>
                  <h4 className="text-xl font-bold text-indigo-600 mb-4 sticky top-0 bg-white/80 backdrop-blur-sm py-2">
                    {new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                  </h4>
                  <div className="space-y-4 border-l-2 border-indigo-100 pl-6 ml-1">
                    {groupedSchedule[date].map(item => (
                      <div key={item.id} className="relative before:content-[''] before:absolute before:left-[-29px] before:top-2 before:w-3 before:h-3 before:bg-indigo-600 before:rounded-full">
                        <p className="text-sm text-slate-500 font-medium">{item.time}</p>
                        <p className="font-semibold text-slate-800">{item.activity}</p>
                        {item.location && (
                          <div className="flex items-center text-sm text-slate-600 mt-1">
                            <span>장소: {item.location}</span>
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
                        {item.cost && (
                          <p className="text-sm text-green-600 mt-1">예상 비용: {item.cost}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-10">생성된 일정이 없습니다.</p>
            )}
          </div>
        </div>

        {/* Checklist Section */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">준비물 체크리스트</h3>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-4 -mr-4">
            {checklist.length > 0 ? (
              checklist.map(item => (
                <div key={item.id} className="flex items-center bg-slate-100 p-3 rounded-md">
                  <input
                    type="checkbox"
                    id={`review-checklist-${item.id}`}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-not-allowed"
                    disabled
                  />
                  <label htmlFor={`review-checklist-${item.id}`} className="ml-3 block text-sm font-medium text-slate-800 flex-grow">
                    {item.text}
                  </label>
                  <a
                      href={`https://www.coupang.com/np/search?q=${encodeURIComponent(item.text)}&lptag=${affiliateTag}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full flex-shrink-0"
                      aria-label={`${item.text} 쿠팡에서 구매하기`}
                      title="쿠팡에서 구매하기"
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                  </a>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-10">추천 준비물이 없습니다.</p>
            )}
          </div>
           {checklist.length > 0 && (
            <p className="mt-4 text-xs text-slate-500 italic">
              이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <button
          onClick={onConfirm}
          className="bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-105 shadow-xl"
        >
          이 계획으로 편집 시작하기
        </button>
      </div>
    </div>
  );
};

export default AIReviewScreen;