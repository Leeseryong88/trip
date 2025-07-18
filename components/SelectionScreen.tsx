
import React from 'react';
import { SparklesIcon, PencilIcon } from './Icons';

interface SelectionScreenProps {
  onSelectAI: () => void;
  onSelectManual: () => void;
}

const SelectionCard: React.FC<{onClick: () => void, icon: React.ReactNode, title: string, description: string}> = ({ onClick, icon, title, description }) => (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
    >
      <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full mb-6">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" })}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 flex-grow">{description}</p>
    </div>
);


const SelectionScreen: React.FC<SelectionScreenProps> = ({ onSelectAI, onSelectManual }) => {
  return (
    <div className="text-center w-full">
      <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">어떻게 여행을 계획하시겠어요?</h2>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
        <SelectionCard
          onClick={onSelectAI}
          icon={<SparklesIcon />}
          title="AI 자동 일정 생성"
          description="여행지와 컨셉만 알려주세요. AI가 전체 일정을 추천하고 만들어 드립니다."
        />
        <SelectionCard
          onClick={onSelectManual}
          icon={<PencilIcon />}
          title="수동 일정 관리"
          description="자신만의 일정을 직접 입력하고, 편집하며, 멋진 HTML 파일로 다운로드하세요."
        />
      </div>
    </div>
  );
};

export default SelectionScreen;