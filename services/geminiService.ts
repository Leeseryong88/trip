
import { GoogleGenAI, Type } from "@google/genai";
import type { ScheduleItem, NearbyPlace } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = "gemini-2.5-flash";

export interface AIGeneratedPlan {
    schedule: Omit<ScheduleItem, 'id'>[];
    checklist: string[];
}

export const generateFullItineraryFromPrompt = async (
  destination: string,
  concept: string,
  startDate: string,
  endDate: string,
  numberOfPeople: string
): Promise<AIGeneratedPlan> => {
    if (!destination || !startDate || !endDate || !numberOfPeople) {
        throw new Error("필수 입력값이 누락되었습니다.");
    }

  const prompt = `
    당신은 전문 여행 플래너 AI입니다. 사용자의 요청에 따라 포괄적이고 실용적인 여행 일정을 만드는 것이 당신의 임무입니다.
    
    사용자 요청:
    - 여행지: ${destination}
    - 여행 컨셉: ${concept || '지정되지 않음'}
    - 여행 날짜: ${startDate}부터 ${endDate}까지
    - 인원: ${numberOfPeople}명

    상세한 일일 시간표와 종합적인 준비물 체크리스트를 생성해주세요.

    **출력 요구사항:**
    1.  **일정:** 구조화된 일정을 생성하세요. 각 활동에 대해 날짜(YYYY-MM-DD), 시간(HH:MM), 활동에 대한 간단한 설명, 특정 장소 이름 및 해당되는 경우 예상 비용을 제공하세요. 일정은 장소 간 이동 시간을 고려하여 논리적이고 즐거워야 합니다.
    2.  **체크리스트:** 생성한 일정의 목적지, 날짜, 활동에 맞는 준비물 체크리스트를 만드세요. 일반적인 항목과 계획된 활동에 필요한 특정 항목을 포함하세요.
    3.  **형식:** 제공된 JSON 스키마를 엄격하게 따르는 단일 JSON 객체로 데이터를 반환하세요. JSON 객체 외부에는 텍스트나 마크다운 서식을 추가하지 마세요.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              description: "상세 여행 일정.",
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: "활동 날짜 (YYYY-MM-DD)." },
                  time: { type: Type.STRING, description: "활동 시간 (HH:MM)." },
                  activity: { type: Type.STRING, description: "활동에 대한 간결한 설명." },
                  cost: { type: Type.STRING, description: "예상 비용 (예: '₩20,000')." },
                  location: { type: Type.STRING, description: "장소의 구체적인 이름 (예: '경복궁')." }
                },
                required: ["date", "time", "activity"]
              }
            },
            checklist: {
              type: Type.ARRAY,
              description: "포괄적인 준비물 체크리스트.",
              items: {
                type: Type.STRING,
                description: "단일 체크리스트 항목."
              }
            }
          },
          required: ["schedule", "checklist"]
        }
      }
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
      throw new Error("AI가 유효한 계획을 반환하지 않았습니다.");
    }
    const parsedJson = JSON.parse(jsonString);
    return parsedJson as AIGeneratedPlan;

  } catch (error) {
    console.error("Error generating full itinerary with Gemini API:", error);
    throw new Error("AI 일정 생성에 실패했습니다. 입력값을 확인하고 다시 시도해주세요.");
  }
};


// Main function to generate the final HTML page
const generateHtmlPrompt = (schedule: ScheduleItem[], checklist: string[]): string => {
  const scheduleString = schedule.map(item => {
      let entry = `- 날짜: ${item.date}, 시간: ${item.time}, 활동: ${item.activity}`;
      if(item.cost) {
          entry += `, 비용: ${item.cost}`;
      }
      if(item.location) {
        entry += `, 장소: ${item.location}`;
      }
      return entry;
  }).join("\n");

  const checklistString = checklist.map(item => `- ${item}`).join("\n");

  return `
    당신은 아름다운 단일 페이지 여행 일정을 만드는 전문 웹 디자이너입니다.
    당신의 임무는 다음 사용자 제공 일정과 준비물 목록을 완전한, 상호작용적인, 독립형 HTML 파일로 변환하는 것입니다.

    **HTML 출력 요구사항:**
    1.  **구조:** 완전한 HTML5 문서(<!DOCTYPE html>부터 </html>까지)를 생성하세요.
    2.  **스타일:** 모든 스타일링에 Tailwind CSS를 반드시 사용해야 합니다. <head> 안에 Tailwind CDN 스크립트('<script src="https://cdn.tailwindcss.com"></script>')를 포함하세요. 다른 CSS나 <style> 태그는 사용하지 마세요.
    3.  **콘텐츠:**
        *   여행 일정에 어울리는 매력적인 한글 제목을 만드세요 (예: "우리의 잊지 못할 여정").
        *   배경은 'bg-slate-100'이나 'bg-gray-50'과 같이 밝고 우아한 색상이어야 합니다.
        *   주요 콘텐츠 컨테이너는 'max-w-4xl mx-auto p-8' 스타일을 적용하세요.
    4.  **탭 인터페이스:** "여행 일정"과 "준비물 체크리스트" 두 개의 탭을 만들어야 합니다.
        *   탭 버튼 그룹을 만드세요. 활성 탭 버튼은 'bg-indigo-600 text-white' 스타일을, 비활성 탭은 'bg-white text-slate-600' 스타일을 적용해야 합니다. 각 버튼에 id="scheduleButton"과 id="checklistButton"을 부여하세요.
        *   두 개의 콘텐츠 패널(div)을 만드세요. 하나는 일정용, 다른 하나는 체크리스트용입니다. 패널 ID는 각각 'scheduleTab'과 'checklistTab'으로 지정하세요.
        *   기본적으로 'scheduleTab'은 보이고 'checklistTab'은 숨겨져야 합니다 ('hidden' 클래스 사용).
    5.  **여행 일정 탭 (scheduleTab):**
        *   일정 항목들을 날짜별로 그룹화하세요. 각 날짜는 'text-2xl font-bold text-gray-700 mb-4'과 같이 눈에 띄는 제목이어야 합니다.
        *   각 일정 카드는 그림자('shadow-md'), 둥근 모서리('rounded-lg'), 그리고 패딩('p-4')을 가진 'bg-white'여야 합니다.
        *   각 카드 안에는 시간, 활동, 비용(제공된 경우), 그리고 장소(제공된 경우)를 명확하게 표시하세요.
    6.  **준비물 체크리스트 탭 (checklistTab):**
        *   제공된 준비물 목록을 기반으로 체크리스트를 생성하세요.
        *   각 항목은 \`<div class="flex items-center p-2 rounded-md hover:bg-slate-200">\` 안에 \`<input type="checkbox">\`와 \`<label>\`을 포함해야 합니다.
        *   체크박스에 \`onchange="toggleChecked(this)"\` 이벤트를 추가하세요.
        *   체크된 항목의 \`label\` 텍스트는 취소선('line-through')과 회색('text-slate-500')으로 스타일이 변경되어야 합니다.
    7.  **상호작용성 (JavaScript):**
        *   </body> 태그 바로 앞에 <script> 태그를 추가하고 다음 JavaScript 코드를 정확히 포함하세요. 이 코드는 탭 전환과 체크리스트 항목 상태 변경을 처리합니다.
        
        <script>
            function switchTab(tabName) {
                const tabButtons = {
                    schedule: document.getElementById('scheduleButton'),
                    checklist: document.getElementById('checklistButton'),
                };
                const tabPanels = {
                    schedule: document.getElementById('scheduleTab'),
                    checklist: document.getElementById('checklistTab'),
                };
                
                Object.values(tabButtons).forEach(button => {
                    if (button) {
                        button.classList.remove('bg-indigo-600', 'text-white');
                        button.classList.add('bg-white', 'text-slate-600');
                    }
                });
                Object.values(tabPanels).forEach(panel => {
                    if (panel) panel.classList.add('hidden');
                });

                if (tabButtons[tabName]) {
                    tabButtons[tabName].classList.add('bg-indigo-600', 'text-white');
                    tabButtons[tabName].classList.remove('bg-white', 'text-slate-600');
                }
                if (tabPanels[tabName]) {
                    tabPanels[tabName].classList.remove('hidden');
                }
            }

            function toggleChecked(checkbox) {
                const label = checkbox.nextElementSibling;
                if (label) {
                    if (checkbox.checked) {
                        label.classList.add('line-through', 'text-slate-500');
                    } else {
                        label.classList.remove('line-through', 'text-slate-500');
                    }
                }
            }

            document.addEventListener('DOMContentLoaded', () => {
                const scheduleButton = document.getElementById('scheduleButton');
                const checklistButton = document.getElementById('checklistButton');
                if(scheduleButton) scheduleButton.addEventListener('click', () => switchTab('schedule'));
                if(checklistButton) checklistButton.addEventListener('click', () => switchTab('checklist'));
                
                // Initialize default tab
                switchTab('schedule');
            });
        <\/script>

    **여행 일정 데이터:**
    ${scheduleString}

    **준비물 목록 데이터:**
    ${checklistString}

    결과물로 순수 HTML 코드만 제공해주세요. 코드 주변에 설명이나 마크다운 서식을 포함하지 마세요.
  `;
};

export const generateItineraryHtml = async (schedule: ScheduleItem[], checklist: string[]): Promise<string> => {
  if (!schedule || schedule.length === 0) {
    return Promise.resolve("");
  }

  const prompt = generateHtmlPrompt(schedule, checklist);
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating itinerary with Gemini API:", error);
    throw new Error("여행 일정 생성에 실패했습니다. API 설정을 확인하고 다시 시도해주세요.");
  }
};


export const generateChecklistFromSchedule = async (schedule: Omit<ScheduleItem, 'id'>[]): Promise<string[]> => {
  if (!schedule || schedule.length === 0) {
    return Promise.resolve([]);
  }

  const scheduleString = schedule.map(item => 
      `- ${item.date}: ${item.activity} at ${item.location || 'unspecified location'}`
  ).join("\n");

  const prompt = `
    당신은 매우 꼼꼼하고 실용적인 여행 전문가입니다. 다음 여행 일정을 아주 세심하게 분석하여, 각 활동에 필요한 모든 준비물을 포함한 포괄적인 체크리스트를 생성해주세요.
    단순한 일반 항목을 넘어서, 각 활동의 특성을 깊이 고려하여 구체적이고 상세한 준비물을 추천해야 합니다.
    
    예를 들어, 일정에 '수영'이 포함되어 있다면, 단순히 '수영복'만 추천하는 것이 아니라 '수영복, 수경, 수모, 방수 가방, 비치 타월'과 같이 관련된 모든 항목을 세부적으로 나열해야 합니다.
    '등산'이 있다면 '등산화, 등산 스틱, 충분한 물, 에너지바, 지도, 보조 배터리' 등을 포함시켜주세요.

    일정의 모든 활동, 장소, 기간을 종합적으로 고려하여 빠진 물건이 없도록 완벽한 체크리스트를 만들어주세요.
    결과는 준비물 항목의 문자열을 담은 JSON 배열 형식이어야 합니다.

    여행 일정:
    ${scheduleString}

    결과물로 순수 JSON 배열만 반환해주세요. 다른 설명은 붙이지 마세요.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "여행에 필요한 준비물 항목"
          }
        }
      }
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
        return [];
    }
    const parsedJson = JSON.parse(jsonString);
    return Array.isArray(parsedJson) ? parsedJson : [];

  } catch (error) {
    console.error("Error generating checklist with Gemini API:", error);
    throw new Error("준비물 목록 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};


// New function to parse narrative text into schedule items
export const generateScheduleFromText = async (text: string): Promise<Omit<ScheduleItem, 'id'>[]> => {
  if (!text.trim()) {
    return Promise.resolve([]);
  }

  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    당신은 지능형 여행 비서입니다. 당신의 임무는 다음 텍스트를 분석하고 구조화된 일정 항목 목록을 추출하는 것입니다.
    현재 날짜는 ${today}입니다. 날짜와 시간을 논리적으로 추론하세요. 연도가 지정되지 않은 경우 현재 연도를 가정하세요. 날짜가 한 번 언급되면, 같은 날의 후속 이벤트는 해당 날짜를 사용해야 합니다.
    활동, 날짜(YYYY-MM-DD 형식), 시간(HH:MM 24시간 형식), 그리고 언급된 경우 비용과 **구체적인 장소 이름**을 추출하세요. 장소는 활동이 일어나는 특정 지점이어야 합니다 (예: '경복궁', 'N서울타워', '해운대 해수욕장').
    제공된 스키마를 준수하는 JSON 배열로 데이터를 반환하세요.

    사용자 설명:
    "${text}"
  `;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "활동 날짜 (YYYY-MM-DD 형식)" },
              time: { type: Type.STRING, description: "활동 시간 (HH:MM 형식)" },
              activity: { type: Type.STRING, description: "활동에 대한 간결한 설명" },
              cost: { type: Type.STRING, description: "언급된 경우 활동 비용 (예: '50달러', '25유로', '30000원')" },
              location: { type: Type.STRING, description: "활동이 일어나는 구체적인 장소 이름 (예: '경복궁', '제주국제공항')" }
            },
            required: ["date", "time", "activity"]
          }
        }
      }
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
        return [];
    }
    const parsedJson = JSON.parse(jsonString);
    // Ensure it's an array before returning
    return Array.isArray(parsedJson) ? parsedJson : [];

  } catch (error) {
    console.error("Error parsing narrative with Gemini API:", error);
    throw new Error("설명을 이해하지 못했습니다. 다른 표현으로 다시 시도하거나 입력을 확인해주세요.");
  }
};

export const findNearbyPlaces = async (
    location: string, 
    placeType: '맛집' | '명소'
): Promise<NearbyPlace[]> => {
    if (!location) {
        throw new Error("기준 장소가 필요합니다.");
    }

    const prompt = `
        당신은 현지 여행 가이드 전문가입니다.
        '${location}' 주변에 있는 인기있는 ${placeType} 5곳을 추천해주세요.
        각 장소에 대해 이름과 1-2 문장의 간략한 설명을 제공해주세요.
        결과는 반드시 지정된 JSON 스키마를 따르는 배열이어야 합니다. 다른 텍스트나 설명 없이 JSON 배열만 반환해주세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: {
                                type: Type.STRING,
                                description: '추천 장소의 이름'
                            },
                            description: {
                                type: Type.STRING,
                                description: '추천 장소에 대한 1-2 문장의 간략한 설명'
                            }
                        },
                        required: ["name", "description"]
                    }
                }
            }
        });
        
        const jsonString = response.text.trim();
        if (!jsonString) {
            return [];
        }
        const parsedJson = JSON.parse(jsonString);
        return Array.isArray(parsedJson) ? parsedJson : [];

    } catch(error) {
        console.error("Error finding nearby places with Gemini API:", error);
        throw new Error(`주변 ${placeType} 정보를 가져오는데 실패했습니다.`);
    }
};