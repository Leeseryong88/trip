



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
                  location: { type: Type.STRING, description: "구글 지도에서 검색 가능한 장소의 구체적인 이름 또는 주소 (예: '서울 경복궁', 'N서울타워')." }
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
const generateHtmlPrompt = (schedule: ScheduleItem[], checklist: string[], fullMapUrl: string): string => {
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
  
  // Calculate total cost
  const totalCost = schedule.reduce((total, item) => {
    if (item.cost) {
      // Extracts numbers from strings like '₩20,000', '$50', '30000원'
      const costValue = parseInt(item.cost.replace(/[^\d]/g, ''), 10);
      if (!isNaN(costValue)) {
        return total + costValue;
      }
    }
    return total;
  }, 0);

  // Format total cost, assuming KRW if numbers are present.
  const totalCostString = totalCost > 0 
    ? `${totalCost.toLocaleString('ko-KR')}원` 
    : "표시할 경비 정보가 없습니다.";

  return `
    당신은 아름다운 단일 페이지 여행 일정을 만드는 전문 웹 디자이너입니다.
    당신의 임무는 다음 사용자 제공 일정, 준비물 목록, 총 경비, 전체 경로 지도 URL 데이터를 완전한, 상호작용적인, 독립형 HTML 파일로 변환하는 것입니다.

    **HTML 출력 요구사항:**
    1.  **구조:** 완전한 HTML5 문서(<!DOCTYPE html>부터 </html>까지)를 생성하세요.
    2.  **스타일:** 모든 스타일링에 Tailwind CSS를 반드시 사용해야 합니다. <head> 안에 Tailwind CDN 스크립트('<script src="https://cdn.tailwindcss.com"></script>')를 포함하세요. 다른 CSS나 <style> 태그는 사용하지 마세요.
    3.  **콘텐츠:**
        *   여행 일정에 어울리는 매력적인 한글 제목을 만드세요 (예: "우리의 잊지 못할 여정").
        *   배경은 'bg-slate-100'이나 'bg-gray-50'과 같이 밝고 우아한 색상이어야 합니다.
        *   주요 콘텐츠 컨테이너는 'max-w-4xl mx-auto p-8' 스타일을 적용하세요.
    4.  **탭 인터페이스:** "여행 일정", "준비물 체크리스트", 그리고 "전체 경로 지도" 세 개의 탭을 만들어야 합니다.
        *   탭 버튼 그룹을 만드세요. 활성 탭 버튼은 'bg-indigo-600 text-white' 스타일을, 비활성 탭은 'bg-white text-slate-600' 스타일을 적용해야 합니다. 각 버튼에 id="scheduleButton", id="checklistButton", 그리고 id="mapButton"을 부여하세요.
        *   세 개의 콘텐츠 패널(div)을 만드세요. 일정용, 체크리스트용, 그리고 지도용입니다. 패널 ID는 각각 'scheduleTab', 'checklistTab', 'mapTab'으로 지정하세요.
        *   기본적으로 'scheduleTab'은 보이고 나머지 탭들은 숨겨져야 합니다 ('hidden' 클래스 사용).
    5.  **여행 일정 탭 (scheduleTab):**
        *   일정 목록 위에, 제공된 **총 경비 데이터**를 사용하여 총 예상 경비를 표시하는 섹션을 만드세요. 이 섹션은 'bg-white p-4 rounded-lg shadow-md mb-6' 스타일을 적용하여 눈에 띄게 만들고, '총 예상 경비'라는 제목과 함께 경비 금액을 'text-xl font-bold text-indigo-700' 스타일로 보여주세요.
        *   일정 항목들을 날짜별로 그룹화하세요. 각 날짜는 'text-2xl font-bold text-gray-700 mb-4'과 같이 눈에 띄는 제목이어야 합니다.
        *   각 일정 카드는 그림자('shadow-md'), 둥근 모서리('rounded-lg'), 그리고 패딩('p-4')을 가진 'bg-white'여야 합니다.
        *   각 카드 안에는 시간, 활동, 비용(제공된 경우), 그리고 장소(제공된 경우)를 명확하게 표시하세요.
        *   **장소가 제공된 경우, 장소 이름 옆에 Google 지도로 연결되는 링크를 추가해야 합니다.** 이 링크는 \`<a>\` 태그여야 하고, \`href\`는 \`https://www.google.com/maps/search/?api=1&query=URL_ENCODED_LOCATION_NAME\` 형식이어야 합니다. 링크는 새 탭에서 열리도록 \`target="_blank"\` 속성을 포함해야 합니다. 링크 안에는 '지도에서 보기'라는 텍스트와 함께 다음 SVG 아이콘을 표시하여 시각적으로 나타내세요: \`<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block ml-1.5 text-slate-400 hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>\`.
    6.  **준비물 체크리스트 탭 (checklistTab):**
        *   제공된 준비물 목록을 기반으로 체크리스트를 생성하세요.
        *   각 항목은 \`<div class="flex items-center p-2 rounded-md hover:bg-slate-200">\` 안에 \`<input type="checkbox">\`와 \`<label>\`을 포함해야 합니다.
        *   체크박스에 \`onchange="toggleChecked(this)"\` 이벤트를 추가하세요.
        *   체크된 항목의 \`label\` 텍스트는 취소선('line-through')과 회색('text-slate-500')으로 스타일이 변경되어야 합니다.
    7.  **전체 경로 지도 탭 (mapTab):**
        *   이 탭 패널은 'bg-white p-8 rounded-lg shadow-md text-center' 스타일을 적용하세요.
        *   ${fullMapUrl ?
            `'<h3 class="text-xl font-bold text-slate-800 mb-6">전체 여행 경로를 확인해보세요!</h3>' 라는 제목을 추가하세요. 그 아래에 사용자가 전체 여행 경로를 볼 수 있는 버튼을 만드세요. 이 버튼은 \`<a>\` 태그여야 하고, \`href\`는 "${fullMapUrl}"이어야 하며, 새 탭에서 열리도록 \`target="_blank"\` 속성을 포함해야 합니다. 버튼 스타일은 'inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg'로 하세요. 버튼 안에는 "Google 지도에서 전체 경로 보기" 텍스트와 함께 지도 아이콘 SVG를 포함하세요: \`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10V7m0 0l6-3m0 0l6 3m-6-3v10" /></svg>\`.`
            :
            `'경로를 표시할 장소가 충분하지 않습니다. 일정에 장소를 추가해 주세요.' 라는 메시지를 'text-slate-500 text-center py-10' 스타일로 표시하세요.`
        }
    8.  **상호작용성 (JavaScript):**
        *   </body> 태그 바로 앞에 <script> 태그를 추가하고 다음 JavaScript 코드를 정확히 포함하세요. 이 코드는 탭 전환과 체크리스트 항목 상태 변경을 처리합니다.
        
        <script>
            function switchTab(tabName) {
                const tabButtons = {
                    schedule: document.getElementById('scheduleButton'),
                    checklist: document.getElementById('checklistButton'),
                    map: document.getElementById('mapButton'),
                };
                const tabPanels = {
                    schedule: document.getElementById('scheduleTab'),
                    checklist: document.getElementById('checklistTab'),
                    map: document.getElementById('mapTab'),
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

                if (tabButtons[tabName] && tabPanels[tabName]) {
                    tabButtons[tabName].classList.add('bg-indigo-600', 'text-white');
                    tabButtons[tabName].classList.remove('bg-white', 'text-slate-600');
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
                const mapButton = document.getElementById('mapButton');

                if(scheduleButton) scheduleButton.addEventListener('click', () => switchTab('schedule'));
                if(checklistButton) checklistButton.addEventListener('click', () => switchTab('checklist'));
                if(mapButton) mapButton.addEventListener('click', () => switchTab('map'));
                
                // Initialize default tab
                switchTab('schedule');
            });
        <\/script>

    **여행 일정 데이터:**
    ${scheduleString}

    **준비물 목록 데이터:**
    ${checklistString}
    
    **총 경비 데이터:**
    ${totalCostString}

    결과물로 순수 HTML 코드만 제공해주세요. 코드 주변에 설명이나 마크다운 서식을 포함하지 마세요.
  `;
};

export const generateItineraryHtml = async (schedule: ScheduleItem[], checklist: string[]): Promise<string> => {
  if (!schedule || schedule.length === 0) {
    return Promise.resolve("");
  }

  // Sort schedule by date and time to ensure logical path
  const sortedSchedule = [...schedule].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return dateA - dateB;
  });

  // Extract unique locations in chronological order
  const uniqueLocations = sortedSchedule
    .map(item => item.location)
    .filter((location, index, self): location is string => !!location && self.indexOf(location) === index);

  let fullMapUrl = '';
  if (uniqueLocations.length >= 2) {
      const origin = encodeURIComponent(uniqueLocations[0]);
      const destination = encodeURIComponent(uniqueLocations[uniqueLocations.length - 1]);
      const waypoints = uniqueLocations.slice(1, -1).map(loc => encodeURIComponent(loc)).join('|');
      fullMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      if (waypoints) {
          fullMapUrl += `&waypoints=${waypoints}`;
      }
  } else if (uniqueLocations.length === 1) {
      fullMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(uniqueLocations[0])}`;
  }


  const prompt = generateHtmlPrompt(schedule, checklist, fullMapUrl);
  
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
        각 장소에 대해 이름, 1-2 문장의 간략한 설명, 그리고 구글 지도에서 검색 가능한 정확한 주소를 제공해주세요.
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
                            },
                            address: {
                                type: Type.STRING,
                                description: '구글 지도에서 검색 가능한 주소'
                            }
                        },
                        required: ["name", "description", "address"]
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