import React from 'react';
import type { ScheduleItem, UIChecklistItem } from '../types';
import { ExternalLinkIcon, ShoppingCartIcon } from './Icons';
import { useResponsiveLayout } from '../services/deviceDetection';

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
  
  // 디바이스 정보와 레이아웃 설정 가져오기
  const { deviceInfo, layoutConfig, isMobile, isTablet, isDesktop } = useResponsiveLayout();

  // 디바이스별 스타일 설정
  const getLayoutStyles = () => {
    if (isMobile) {
      return {
        container: "max-w-full mx-auto w-full px-3",
        header: {
          title: "text-2xl font-extrabold text-slate-800 tracking-tight text-center",
          subtitle: "mt-3 text-sm text-slate-600 text-center px-2",
          margin: "mb-6"
        },
        grid: {
          layout: "grid grid-cols-1 gap-4 items-start",
          scheduleSpan: "",
          checklistSpan: ""
        },
        card: {
          padding: "p-4",
          title: "text-lg font-bold text-slate-800 mb-4 border-b pb-3",
          scrollHeight: "max-h-[40vh]",
          itemSpacing: "space-y-4"
        },
        schedule: {
          dateTitle: "text-base font-bold text-indigo-600 mb-3 sticky top-0 bg-white/95 backdrop-blur-sm py-2",
          timeline: "space-y-3 border-l-2 border-indigo-100 pl-3 ml-1",
          dotPosition: "before:left-[-13px] before:top-2 before:w-2 before:h-2",
          timeText: "text-xs text-slate-500 font-medium",
          activityText: "font-semibold text-slate-800 text-sm",
          locationText: "text-xs text-slate-600 mt-1",
          costText: "text-xs text-green-600 mt-1",
          iconSize: "h-3 w-3"
        },
        checklist: {
          itemPadding: "p-2",
          checkboxSize: "h-4 w-4",
          textSize: "text-xs font-medium",
          iconSize: "h-4 w-4"
        },
        button: {
          container: "mt-6 text-center px-2",
          classes: "bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-105 shadow-xl w-full text-base"
        }
      };
    } else if (isTablet) {
      return {
        container: "max-w-5xl mx-auto w-full px-4",
        header: {
          title: "text-3xl font-extrabold text-slate-800 tracking-tight text-center",
          subtitle: "mt-4 text-base text-slate-600 text-center max-w-2xl mx-auto",
          margin: "mb-10"
        },
        grid: {
          layout: "grid grid-cols-1 lg:grid-cols-3 gap-6 items-start",
          scheduleSpan: "lg:col-span-2",
          checklistSpan: ""
        },
        card: {
          padding: "p-6",
          title: "text-xl font-bold text-slate-800 mb-6 border-b pb-4",
          scrollHeight: "max-h-[55vh]",
          itemSpacing: "space-y-6"
        },
        schedule: {
          dateTitle: "text-lg font-bold text-indigo-600 mb-4 sticky top-0 bg-white/95 backdrop-blur-sm py-2",
          timeline: "space-y-4 border-l-2 border-indigo-100 pl-5 ml-1",
          dotPosition: "before:left-[-21px] before:top-2 before:w-3 before:h-3",
          timeText: "text-sm text-slate-500 font-medium",
          activityText: "font-semibold text-slate-800 text-base",
          locationText: "text-sm text-slate-600 mt-1",
          costText: "text-sm text-green-600 mt-1",
          iconSize: "h-4 w-4"
        },
        checklist: {
          itemPadding: "p-3",
          checkboxSize: "h-4 w-4",
          textSize: "text-sm font-medium",
          iconSize: "h-5 w-5"
        },
        button: {
          container: "mt-10 text-center",
          classes: "bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-105 shadow-xl text-lg"
        }
      };
    } else {
      return {
        container: "max-w-6xl mx-auto w-full px-4 lg:px-0",
        header: {
          title: "text-4xl font-extrabold text-slate-800 tracking-tight text-center",
          subtitle: "mt-4 text-lg text-slate-600 text-center max-w-3xl mx-auto",
          margin: "mb-12"
        },
        grid: {
          layout: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start",
          scheduleSpan: "lg:col-span-2",
          checklistSpan: ""
        },
        card: {
          padding: "p-6 lg:p-8",
          title: "text-2xl lg:text-3xl font-bold text-slate-800 mb-6 border-b pb-4",
          scrollHeight: "max-h-[60vh]",
          itemSpacing: "space-y-6"
        },
        schedule: {
          dateTitle: "text-xl font-bold text-indigo-600 mb-4 sticky top-0 bg-white/95 backdrop-blur-sm py-2",
          timeline: "space-y-4 border-l-2 border-indigo-100 pl-6 ml-1",
          dotPosition: "before:left-[-29px] before:top-2 before:w-3 before:h-3",
          timeText: "text-sm text-slate-500 font-medium",
          activityText: "font-semibold text-slate-800 text-base",
          locationText: "text-sm text-slate-600 mt-1",
          costText: "text-sm text-green-600 mt-1",
          iconSize: "h-4 w-4"
        },
        checklist: {
          itemPadding: "p-3",
          checkboxSize: "h-4 w-4",
          textSize: "text-sm font-medium",
          iconSize: "h-5 w-5"
        },
        button: {
          container: "mt-12 text-center",
          classes: "bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-105 shadow-xl text-lg"
        }
      };
    }
  };

  const layoutStyles = getLayoutStyles();

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.header.margin}>
        <h2 className={layoutStyles.header.title}>AI 추천 여행 계획</h2>
        <p className={layoutStyles.header.subtitle}>
          {isMobile 
            ? "AI가 생성한 계획을 확인하고 편집을 시작하세요."
            : "AI가 생성한 여행 계획을 확인해보세요. 마음에 드신다면 이 계획으로 편집을 시작하여 나만의 여행을 완성할 수 있습니다."
          }
        </p>
      </div>

      <div className={layoutStyles.grid.layout}>
        {/* Schedule Section */}
        <div className={`${layoutStyles.grid.scheduleSpan} bg-white ${layoutStyles.card.padding} rounded-2xl shadow-lg`}>
          <h3 className={layoutStyles.card.title}>상세 여행 일정</h3>
          <div className={`${layoutStyles.card.itemSpacing} ${layoutStyles.card.scrollHeight} overflow-y-auto pr-2 sm:pr-4 lg:pr-6 -mr-2 sm:-mr-4 lg:-mr-6`}>
            {sortedDates.length > 0 ? (
              sortedDates.map(date => (
                <div key={date}>
                  <h4 className={layoutStyles.schedule.dateTitle}>
                    {new Date(date).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric', 
                      weekday: isMobile ? 'short' : 'long' 
                    })}
                  </h4>
                  <div className={layoutStyles.schedule.timeline}>
                    {groupedSchedule[date].map(item => (
                      <div key={item.id} className={`relative before:content-[''] before:absolute ${layoutStyles.schedule.dotPosition} before:bg-indigo-600 before:rounded-full`}>
                        <p className={layoutStyles.schedule.timeText}>{item.time}</p>
                        <p className={layoutStyles.schedule.activityText}>{item.activity}</p>
                        {item.location && (
                          <div className={`flex items-center ${layoutStyles.schedule.locationText}`}>
                            <span>장소: {item.location}</span>
                             <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-1.5 lg:ml-2 flex-shrink-0 p-1 lg:p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors min-h-8 min-w-8 lg:min-h-10 lg:min-w-10"
                                title="지도에서 위치 보기"
                            >
                                <ExternalLinkIcon className={layoutStyles.schedule.iconSize} />
                            </a>
                          </div>
                        )}
                        {item.cost && (
                          <p className={layoutStyles.schedule.costText}>예상 비용: {item.cost}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-10 lg:py-16 text-base lg:text-lg">생성된 일정이 없습니다.</p>
            )}
          </div>
        </div>

        {/* Checklist Section */}
        <div className={`${layoutStyles.grid.checklistSpan} bg-white ${layoutStyles.card.padding} rounded-2xl shadow-lg`}>
          <h3 className={layoutStyles.card.title}>준비물 체크리스트</h3>
          <div className={`space-y-2 sm:space-y-3 lg:space-y-4 ${layoutStyles.card.scrollHeight} overflow-y-auto pr-2 sm:pr-4 lg:pr-6 -mr-2 sm:-mr-4 lg:-mr-6`}>
            {checklist.length > 0 ? (
              checklist.map(item => (
                <div key={item.id} className={`flex items-center bg-slate-100 ${layoutStyles.checklist.itemPadding} rounded-md lg:rounded-lg`}>
                  <input
                    type="checkbox"
                    id={`review-checklist-${item.id}`}
                    className={`${layoutStyles.checklist.checkboxSize} rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-not-allowed flex-shrink-0`}
                    disabled
                  />
                  <label htmlFor={`review-checklist-${item.id}`} className={`ml-2 sm:ml-3 lg:ml-4 block ${layoutStyles.checklist.textSize} text-slate-800 flex-grow`}>
                    {item.text}
                  </label>
                  <a
                      href={`https://www.coupang.com/np/search?q=${encodeURIComponent(item.text)}&lptag=${affiliateTag}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 sm:p-2 lg:p-3 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full flex-shrink-0 min-h-8 min-w-8 lg:min-h-12 lg:min-w-12"
                      aria-label={`${item.text} 쿠팡에서 구매하기`}
                      title="쿠팡에서 구매하기"
                    >
                      <ShoppingCartIcon className={layoutStyles.checklist.iconSize} />
                  </a>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-10 lg:py-16 text-base lg:text-lg">추천 준비물이 없습니다.</p>
            )}
          </div>
           {checklist.length > 0 && (
            <p className="mt-4 lg:mt-6 text-xs lg:text-sm text-slate-500 italic">
              이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
          )}
        </div>
      </div>
      
      <div className={layoutStyles.button.container}>
        <button
          onClick={onConfirm}
          className={layoutStyles.button.classes}
        >
          이 계획으로 편집 시작하기
        </button>
      </div>
    </div>
  );
};

export default AIReviewScreen;